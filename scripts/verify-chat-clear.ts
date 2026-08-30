import "dotenv/config";
import { ConversationMode, EntityStatus } from "../src/generated/prisma/enums";
import { prisma } from "../src/server/db/prisma";
import { softDeleteAllUserConversations } from "../src/server/repositories/chat-repository";

const email = `chat-clear-check-${Date.now()}@local.invalid`;
let userId: string | null = null;

async function main() {
  const user = await prisma.user.create({
    data: {
      email,
      displayName: "会话清空测试用户",
      conversations: {
        create: [
          { mode: ConversationMode.LISTENING, title: "测试会话一", messages: { create: { role: "USER", content: "测试消息一", sequenceNo: 1 } } },
          { mode: ConversationMode.ADVICE, title: "测试会话二", messages: { create: { role: "USER", content: "测试消息二", sequenceNo: 1 } } },
        ],
      },
    },
  });
  userId = user.id;
  const count = await softDeleteAllUserConversations(user.id);
  const conversations = await prisma.conversation.findMany({ where: { userId: user.id }, include: { messages: true } });
  if (count !== 2 || conversations.some((item) => item.status !== EntityStatus.DELETED || !item.deletedAt) || conversations.some((item) => item.messages.length !== 1)) {
    throw new Error("Chat history clear verification failed");
  }
  console.log({ clearVerified: true, deletedCount: count, messagesAwaitingCleanup: 2 });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (userId) await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });
