import "dotenv/config";
import { prisma } from "../src/server/db/prisma";
import { CURRENT_DEMO_USER_EMAIL } from "../src/server/repositories/current-user-repository";
import { saveCurrentRoleplayReflection } from "../src/server/repositories/reflection-repository";
import { createCurrentRoleplaySession, finishCurrentRoleplaySession, sendCurrentRoleplayMessage } from "../src/server/repositories/roleplay-repository";

let sessionId: string | null = null;
let reflectionId: string | null = null;

async function main() {
  const person = await prisma.person.findFirst({
    where: { user: { email: CURRENT_DEMO_USER_EMAIL }, deletedAt: null },
    select: { id: true },
  });
  if (!person) throw new Error("Reflection verification needs at least one current-user person");

  const session = await createCurrentRoleplaySession({
    personId: person.id,
    scenario: `REFLECTION_WRITE_CHECK_${Date.now()}`,
    userGoal: "清楚说明依赖和下一次同步节点",
    personaStyle: "结果导向",
    difficulty: "NORMAL",
  });
  sessionId = session.id;
  await sendCurrentRoleplayMessage(session.id, "目前依赖接口数据，我会在今天 15:00 再同步一次。" );
  await finishCurrentRoleplaySession(session.id);

  const created = await saveCurrentRoleplayReflection({
    roleplaySessionId: session.id,
    goalSelf: "清楚说明依赖",
    goalOther: "确认结果和时间点",
    whatHappened: "完成了一次项目延期沟通模拟。",
    userFeeling: "担心说明依赖会被理解为推卸责任。",
    workedWell: "说明了具体依赖和同步节点。",
    improvements: "补充风险触发后的替代动作。",
    nextExperiment: "下一次先说共同目标，再说明依赖。",
  });
  reflectionId = created.id;

  const updated = await saveCurrentRoleplayReflection({
    roleplaySessionId: session.id,
    goalSelf: "清楚说明依赖",
    goalOther: "确认结果和时间点",
    whatHappened: "完成了一次项目延期沟通模拟。",
    userFeeling: "紧张，但比以前更能停下来组织表达。",
    workedWell: "说明了具体依赖和同步节点。",
    improvements: "补充风险触发后的替代动作。",
    nextExperiment: "下一次增加替代方案和升级节点。",
  });
  const count = await prisma.reflection.count({ where: { roleplaySessionId: session.id } });
  if (created.id !== updated.id || count !== 1 || updated.nextExperiment !== "下一次增加替代方案和升级节点。") {
    throw new Error("Reflection upsert verification failed");
  }
  console.log({ reflectionWriteVerified: true, sameRecordUpdated: true, duplicateCount: count, roleplayLinked: true });
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => {
    if (reflectionId) await prisma.reflection.delete({ where: { id: reflectionId } });
    if (sessionId) await prisma.roleplaySession.delete({ where: { id: sessionId } });
    await prisma.$disconnect();
  });
