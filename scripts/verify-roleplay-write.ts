import "dotenv/config";
import { prisma } from "../src/server/db/prisma";
import { createCurrentRoleplaySession, finishCurrentRoleplaySession, sendCurrentRoleplayMessage } from "../src/server/repositories/roleplay-repository";
import { CURRENT_DEMO_USER_EMAIL } from "../src/server/repositories/current-user-repository";

let sessionId: string | null = null;

async function main() {
  const person = await prisma.person.findFirst({ where: { user: { email: CURRENT_DEMO_USER_EMAIL }, deletedAt: null }, select: { id: true } });
  if (!person) throw new Error("Roleplay verification needs at least one current-user person");

  const session = await createCurrentRoleplaySession({
    personId: person.id,
    scenario: `ROLEPLAY_WRITE_CHECK_${Date.now()}`,
    userGoal: "验证模拟会话、消息与复盘可以完整写入",
    personaStyle: "结果导向",
    difficulty: "NORMAL",
  });
  sessionId = session.id;
  if (session.messages.length !== 1 || session.messages[0]?.role !== "ASSISTANT") throw new Error("Roleplay creation verification failed");

  await sendCurrentRoleplayMessage(session.id, "分析已经完成，目前依赖后端接口数据；我会在今天 15:00 再同步一次。" );
  const written = await prisma.roleplaySession.findUnique({ where: { id: session.id }, include: { messages: { orderBy: { sequenceNo: "asc" } } } });
  if (!written || written.messages.length !== 3 || written.messages[1]?.role !== "USER" || written.messages[2]?.role !== "ASSISTANT") throw new Error("Roleplay message verification failed");

  const review = await finishCurrentRoleplaySession(session.id);
  const archived = await prisma.roleplaySession.findUnique({ where: { id: session.id } });
  if (!archived || archived.status !== "ARCHIVED" || !archived.reviewJson || review.good.length === 0) throw new Error("Roleplay finish verification failed");

  console.log({ roleplayWriteVerified: true, messageCount: written.messages.length, reviewSaved: true, archived: true });
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => {
    if (sessionId) await prisma.roleplaySession.delete({ where: { id: sessionId } });
    await prisma.$disconnect();
  });
