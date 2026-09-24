import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "../src/server/db/prisma";
import { sendUserChatMessage } from "../src/server/repositories/chat-repository";

async function main() {
  const user = await prisma.user.create({ data: { displayName: "历史开关隔离测试" } });
  try {
    const input = { conversationId: null, mode: "LISTENING" as const, content: "测试项目延期" };
    const saved = await sendUserChatMessage(user.id, input);
    assert.equal(saved.persisted, true);
    await prisma.user.update({ where: { id: user.id }, data: { chatHistoryEnabled: false } });
    const temporary = await sendUserChatMessage(user.id, { ...input, saveHistory: true });
    assert.equal(temporary.persisted, false, "服务端设置必须覆盖过期客户端设置");
    assert.equal(await prisma.conversation.count({ where: { userId: user.id } }), 1);
    await assert.rejects(sendUserChatMessage(user.id, { ...input, conversationId: saved.conversationId }), /HISTORY_DISABLED/);
    assert.equal(await prisma.conversationMessage.count({ where: { conversationId: saved.conversationId } }), 3);
    await prisma.user.update({ where: { id: user.id }, data: { chatHistoryEnabled: true } });
    assert.equal((await sendUserChatMessage(user.id, { ...input, saveHistory: false })).persisted, false, "页面内对话不能因重新开启而偷偷入库");
    assert.equal(await prisma.memory.count({ where: { userId: user.id } }), 0, "临时对话不能生成长期记忆");
    assert.equal((await sendUserChatMessage(user.id, input)).persisted, true);
    assert.equal(await prisma.conversation.count({ where: { userId: user.id } }), 2);
    console.log("PASS: 保存开关、一次性临时对话、旧历史保留、过期客户端防护、页面内对话不入库、重新开启。");
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
