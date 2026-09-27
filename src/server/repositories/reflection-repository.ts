import { EntityStatus } from "@/generated/prisma/enums";
import type { ReflectionPageData, ReflectionRecordView } from "@/features/reflection/reflection-types";
import { prisma } from "@/server/db/prisma";
import { CURRENT_DEMO_USER_EMAIL } from "@/server/repositories/current-user-repository";

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Shanghai",
});

type Review = { good: string[]; improve: string; alternative: string; nextFocus: string };

function parseReview(value: unknown): Review | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (!Array.isArray(item.good) || typeof item.improve !== "string" || typeof item.alternative !== "string" || typeof item.nextFocus !== "string") return null;
  return {
    good: item.good.filter((entry): entry is string => typeof entry === "string"),
    improve: item.improve,
    alternative: item.alternative,
    nextFocus: item.nextFocus,
  };
}

function mapReflection(reflection: {
  id: string;
  roleplaySessionId: string | null;
  goalSelf: string | null;
  goalOther: string | null;
  whatHappened: string;
  userFeeling: string | null;
  workedWell: string | null;
  improvements: string | null;
  nextExperiment: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ReflectionRecordView {
  return {
    id: reflection.id,
    roleplaySessionId: reflection.roleplaySessionId,
    goalSelf: reflection.goalSelf ?? "",
    goalOther: reflection.goalOther ?? "",
    whatHappened: reflection.whatHappened,
    userFeeling: reflection.userFeeling ?? "",
    workedWell: reflection.workedWell ?? "",
    improvements: reflection.improvements ?? "",
    nextExperiment: reflection.nextExperiment ?? "",
    createdAt: timeFormatter.format(reflection.createdAt),
    updatedAt: timeFormatter.format(reflection.updatedAt),
  };
}

async function getCurrentUserId() {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: { id: true },
  });
  if (!user) throw new Error("CURRENT_USER_NOT_FOUND");
  return user.id;
}

export async function getCurrentReflectionPageData(sessionId?: string): Promise<ReflectionPageData | null> {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: {
      id: true,
      roleplaySessions: {
        where: { status: EntityStatus.ARCHIVED },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: {
          person: { select: { displayName: true } },
          reflection: { select: { id: true } },
        },
      },
    },
  });
  if (!user) return null;

  const selected = sessionId
    ? await prisma.roleplaySession.findFirst({
        where: { id: sessionId, userId: user.id, status: EntityStatus.ARCHIVED },
        include: {
          person: {
            select: {
              displayName: true,
              relationships: { where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 1 },
            },
          },
          messages: { orderBy: { sequenceNo: "asc" } },
          reflection: true,
        },
      })
    : null;

  return {
    selected: selected
      ? {
          id: selected.id,
          personName: selected.person?.displayName ?? selected.roleTemplate,
          scenario: selected.scenario,
          userGoal: selected.userGoal,
          difficulty: selected.difficulty,
          status: selected.status,
          createdAt: timeFormatter.format(selected.createdAt),
          possibleOtherGoal: selected.person?.relationships[0]?.communicationSummary ?? "对方可能希望尽快确认结果、风险和下一次同步节点。",
          messages: selected.messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            sequenceNo: message.sequenceNo,
          })),
          draftReview: parseReview(selected.reviewJson),
          reflection: selected.reflection ? mapReflection(selected.reflection) : null,
        }
      : null,
    recentRoleplays: user.roleplaySessions.map((session) => ({
      id: session.id,
      personName: session.person?.displayName ?? session.roleTemplate,
      scenario: session.scenario,
      createdAt: timeFormatter.format(session.createdAt),
      hasReflection: Boolean(session.reflection),
    })),
  };
}

export async function saveCurrentRoleplayReflection(input: {
  roleplaySessionId: string;
  goalSelf: string;
  goalOther: string;
  whatHappened: string;
  userFeeling: string;
  workedWell: string;
  improvements: string;
  nextExperiment: string;
}) {
  const userId = await getCurrentUserId();
  const session = await prisma.roleplaySession.findFirst({
    where: { id: input.roleplaySessionId, userId, status: EntityStatus.ARCHIVED },
    select: { id: true },
  });
  if (!session) throw new Error("ROLEPLAY_SESSION_NOT_FOUND");

  const data = {
    userId,
    goalSelf: input.goalSelf || null,
    goalOther: input.goalOther || null,
    whatHappened: input.whatHappened,
    userFeeling: input.userFeeling || null,
    workedWell: input.workedWell || null,
    improvements: input.improvements || null,
    nextExperiment: input.nextExperiment || null,
  };
  const reflection = await prisma.reflection.upsert({
    where: { roleplaySessionId: session.id },
    create: { ...data, roleplaySessionId: session.id },
    update: data,
  });
  return mapReflection(reflection);
}
