import { EntityStatus, MessageRole } from "@/generated/prisma/enums";
import type { RoleplayDifficulty, RoleplayPageData, RoleplayReview } from "@/features/roleplay/roleplay-types";
import { prisma } from "@/server/db/prisma";
import { CURRENT_DEMO_USER_EMAIL } from "@/server/repositories/current-user-repository";

const timeFormatter = new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" });

async function getCurrentUserId() {
  const user = await prisma.user.findUnique({ where: { email: CURRENT_DEMO_USER_EMAIL }, select: { id: true } });
  if (!user) throw new Error("CURRENT_USER_NOT_FOUND");
  return user.id;
}

const mapMessage = (message: { id: string; role: MessageRole; content: string; sequenceNo: number; createdAt: Date }) => ({
  id: message.id,
  role: message.role,
  content: message.content,
  sequenceNo: message.sequenceNo,
  createdAt: timeFormatter.format(message.createdAt),
});

function parseReview(value: unknown): RoleplayReview | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (!Array.isArray(item.good) || typeof item.improve !== "string" || typeof item.alternative !== "string" || typeof item.nextFocus !== "string") return null;
  return { good: item.good.filter((entry): entry is string => typeof entry === "string"), improve: item.improve, alternative: item.alternative, nextFocus: item.nextFocus };
}

const mapSession = (session: {
  id: string; personId: string | null; roleTemplate: string; scenario: string; personaStyle: string | null; difficulty: string; userGoal: string; status: EntityStatus; reviewJson: unknown; createdAt: Date;
  person: { displayName: string } | null;
  messages: Array<{ id: string; role: MessageRole; content: string; sequenceNo: number; createdAt: Date }>;
}) => ({
  id: session.id,
  personId: session.personId,
  personName: session.person?.displayName ?? session.roleTemplate,
  roleTemplate: session.roleTemplate,
  scenario: session.scenario,
  personaStyle: session.personaStyle,
  difficulty: session.difficulty,
  userGoal: session.userGoal,
  status: session.status,
  review: parseReview(session.reviewJson),
  createdAt: timeFormatter.format(session.createdAt),
  messages: session.messages.map(mapMessage),
});

export async function getCurrentRoleplayPageData(): Promise<RoleplayPageData | null> {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: {
      displayName: true,
      people: {
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        include: {
          relationships: { orderBy: { updatedAt: "desc" }, take: 1 },
          observations: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 6 },
          communicationStrategies: { orderBy: { updatedAt: "desc" }, take: 3 },
        },
      },
      roleplaySessions: {
        orderBy: { updatedAt: "desc" },
        take: 12,
        include: { person: { select: { displayName: true } }, messages: { orderBy: { sequenceNo: "asc" } } },
      },
    },
  });
  if (!user) return null;
  return {
    userName: user.displayName,
    people: user.people.map((person) => ({
      id: person.id,
      displayName: person.displayName,
      roleTitle: person.roleTitle,
      relationshipSummary: person.relationships[0]?.communicationSummary ?? null,
      observations: person.observations.map((item) => ({ id: item.id, kind: item.kind, content: item.content, confirmationStatus: item.confirmationStatus })),
      strategies: person.communicationStrategies.map((item) => ({ id: item.id, context: item.context, strategy: item.strategy, status: item.status })),
    })),
    sessions: user.roleplaySessions.map(mapSession),
  };
}

function openingLine(personName: string, scenario: string, difficulty: RoleplayDifficulty) {
  if (difficulty === "EASY") return `${personName}：我看到这个情况了。你先说说目前进展，以及希望我配合什么？`;
  if (difficulty === "HARD") return `${personName}：这件事已经影响节点了。关于“${scenario}”，我现在需要明确结论、责任和时间，不要只告诉我困难。`;
  return `${personName}：关于“${scenario}”，现在具体进展到哪里？我最晚什么时候能拿到结果？`;
}

function mockRoleReply(personName: string, difficulty: string, turn: number) {
  if (difficulty === "HARD") return turn > 1 ? `${personName}：你说了依赖，但如果今天仍拿不到，我需要你给出替代方案和明确的升级节点。` : `${personName}：我需要的是可执行承诺。哪一步由你负责，哪一步需要别人配合，分别什么时候完成？`;
  if (difficulty === "EASY") return turn > 1 ? `${personName}：这个安排我能理解。你希望我现在帮你确认优先级，还是协调依赖方？` : `${personName}：明白了。为了让我放心，你能再说清下一次同步时间吗？`;
  return turn > 1 ? `${personName}：可以，那如果依赖方没有按时给到，你准备什么时候同步风险？` : `${personName}：我听到了现状。请直接告诉我下一步动作、负责人和时间点。`;
}

export async function createCurrentRoleplaySession(input: { personId: string; scenario: string; personaStyle: string; difficulty: RoleplayDifficulty; userGoal: string }) {
  const userId = await getCurrentUserId();
  const person = await prisma.person.findFirst({ where: { id: input.personId, userId, deletedAt: null }, select: { id: true, displayName: true, roleTitle: true } });
  if (!person) throw new Error("PERSON_NOT_FOUND");
  const session = await prisma.roleplaySession.create({
    data: {
      userId,
      personId: person.id,
      roleTemplate: person.roleTitle ?? "职场沟通对象",
      scenario: input.scenario,
      personaStyle: input.personaStyle,
      difficulty: input.difficulty,
      userGoal: input.userGoal,
      messages: { create: { role: MessageRole.ASSISTANT, content: openingLine(person.displayName, input.scenario, input.difficulty), sequenceNo: 1 } },
    },
    include: { person: { select: { displayName: true } }, messages: { orderBy: { sequenceNo: "asc" } } },
  });
  return mapSession(session);
}

export async function sendCurrentRoleplayMessage(sessionId: string, content: string) {
  const userId = await getCurrentUserId();
  return prisma.$transaction(async (tx) => {
    const session = await tx.roleplaySession.findFirst({
      where: { id: sessionId, userId, status: EntityStatus.ACTIVE },
      include: { person: { select: { displayName: true } }, messages: { orderBy: { sequenceNo: "desc" }, take: 1 } },
    });
    if (!session) throw new Error("ROLEPLAY_SESSION_NOT_FOUND");
    const sequenceNo = (session.messages[0]?.sequenceNo ?? 0) + 1;
    const turn = Math.ceil(sequenceNo / 2);
    const [userMessage, assistantMessage] = await Promise.all([
      tx.roleplayMessage.create({ data: { sessionId, role: MessageRole.USER, content, sequenceNo } }),
      tx.roleplayMessage.create({ data: { sessionId, role: MessageRole.ASSISTANT, content: mockRoleReply(session.person?.displayName ?? session.roleTemplate, session.difficulty, turn), sequenceNo: sequenceNo + 1 } }),
    ]);
    await tx.roleplaySession.update({ where: { id: sessionId }, data: { updatedAt: new Date() } });
    return { userMessage: mapMessage(userMessage), assistantMessage: mapMessage(assistantMessage) };
  });
}

export async function finishCurrentRoleplaySession(sessionId: string) {
  const userId = await getCurrentUserId();
  const session = await prisma.roleplaySession.findFirst({ where: { id: sessionId, userId, status: EntityStatus.ACTIVE }, include: { messages: { where: { role: MessageRole.USER }, orderBy: { sequenceNo: "asc" } } } });
  if (!session) throw new Error("ROLEPLAY_SESSION_NOT_FOUND");
  const combined = session.messages.map((item) => item.content).join("；");
  const hasTime = /(今天|明天|周|点|时间|节点|之前|之后)/.test(combined);
  const hasDependency = /(依赖|接口|数据|后端|客户|配合)/.test(combined);
  const review: RoleplayReview = {
    good: [
      hasDependency ? "你说明了当前依赖，没有把阻塞藏起来。" : "你回应了对方的追问，并尝试说明当前情况。",
      hasTime ? "你给出了具体时间或同步节点，让下一步更可判断。" : "你没有回避结果问题，保持了对话推进。",
    ],
    improve: hasTime ? "下一次可以把负责人和风险升级条件再说得更明确。" : "目前缺少明确时间点，容易让对方继续追问“到底什么时候”。",
    alternative: `“我先对齐目标：${session.userGoal}。目前已完成可控部分，剩余依赖我会在今天 15:00 前再次确认；如果仍未到位，我会立即同步风险和替代安排。”`,
    nextFocus: hasDependency && hasTime ? "在时间节点之外，再补一句风险触发后的替代动作。" : "练习用‘事实—依赖—动作—时间点’完整回应一次。",
  };
  await prisma.roleplaySession.update({ where: { id: session.id }, data: { status: EntityStatus.ARCHIVED, reviewJson: review } });
  return review;
}
