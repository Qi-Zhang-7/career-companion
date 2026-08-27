import { ConfirmationStatus, EntityStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db/prisma";
import { CURRENT_DEMO_USER_EMAIL } from "@/server/repositories/current-user-repository";
import type { SettingsPageData } from "@/features/settings/settings-types";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Shanghai" });

async function getCurrentUser() {
  const user = await prisma.user.findUnique({ where: { email: CURRENT_DEMO_USER_EMAIL }, select: { id: true, displayName: true, memoryEnabled: true } });
  if (!user) throw new Error("CURRENT_USER_NOT_FOUND");
  return user;
}

export async function getCurrentSettingsPageData(): Promise<SettingsPageData | null> {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: {
      id: true,
      displayName: true,
      memoryEnabled: true,
      memories: {
        where: { deletedAt: null, status: { not: EntityStatus.DELETED } },
        orderBy: [{ importance: "desc" }, { updatedAt: "desc" }],
        include: {
          evidence: {
            orderBy: { createdAt: "desc" },
            include: { message: { select: { content: true, conversation: { select: { title: true } } } } },
          },
          links: true,
        },
      },
    },
  });
  if (!user) return null;

  const personIds = user.memories.flatMap((memory) => memory.links.filter((link) => link.entityType === "PERSON").map((link) => link.entityId));
  const eventIds = user.memories.flatMap((memory) => memory.links.filter((link) => link.entityType === "WORK_EVENT").map((link) => link.entityId));
  const themeIds = user.memories.flatMap((memory) => memory.links.filter((link) => link.entityType === "GROWTH_THEME").map((link) => link.entityId));
  const [people, events, themes] = await Promise.all([
    prisma.person.findMany({ where: { id: { in: personIds }, userId: user.id }, select: { id: true, displayName: true } }),
    prisma.workEvent.findMany({ where: { id: { in: eventIds }, userId: user.id }, select: { id: true, title: true } }),
    prisma.growthTheme.findMany({ where: { id: { in: themeIds }, userId: user.id }, select: { id: true, title: true } }),
  ]);
  const entityLabels = new Map([
    ...people.map((item) => [item.id, item.displayName] as const),
    ...events.map((item) => [item.id, item.title] as const),
    ...themes.map((item) => [item.id, item.title] as const),
  ]);

  return {
    user: { displayName: user.displayName, memoryEnabled: user.memoryEnabled },
    memories: user.memories.map((memory) => ({
      id: memory.id,
      type: memory.type,
      canonicalText: memory.canonicalText,
      certainty: memory.certainty,
      confidence: memory.confidence,
      importance: memory.importance,
      sensitivity: memory.sensitivity,
      confirmationStatus: memory.confirmationStatus,
      version: memory.version,
      createdAt: dateFormatter.format(memory.createdAt),
      updatedAt: dateFormatter.format(memory.updatedAt),
      evidence: memory.evidence.map((evidence) => ({
        id: evidence.id,
        sourceType: evidence.sourceType,
        sourceId: evidence.sourceId,
        sourceLabel: evidence.message?.conversation.title ? `对话「${evidence.message.conversation.title}」` : evidence.sourceType,
        messageExcerpt: evidence.message?.content.slice(0, 160) ?? null,
        evidenceWeight: evidence.evidenceWeight,
        createdAt: dateFormatter.format(evidence.createdAt),
      })),
      links: memory.links.map((link) => ({
        id: link.id,
        entityType: link.entityType,
        entityId: link.entityId,
        relationType: link.relationType,
        entityLabel: entityLabels.get(link.entityId) ?? `${link.entityType} · ${link.entityId.slice(0, 8)}`,
      })),
    })),
  };
}

export async function setCurrentUserMemoryEnabled(enabled: boolean) {
  const user = await getCurrentUser();
  await prisma.user.update({ where: { id: user.id }, data: { memoryEnabled: enabled } });
}

export async function createCurrentUserMemory(input: {
  type: string;
  canonicalText: string;
  certainty: string;
  sensitivity: string;
  importance: number;
}) {
  const user = await getCurrentUser();
  const memory = await prisma.memory.create({
    data: {
      userId: user.id,
      ...input,
      structuredData: { createdBy: "USER", source: "SETTINGS_MANUAL_INPUT" },
      confidence: 1,
      confirmationStatus: ConfirmationStatus.USER_CONFIRMED,
    },
    select: { id: true },
  });
  return memory.id;
}

export async function reviewCurrentUserMemory(input: {
  memoryId: string;
  decision: "CONFIRM" | "CORRECT" | "REJECT";
  correctedText?: string;
}) {
  const user = await getCurrentUser();
  const memory = await prisma.memory.findFirst({ where: { id: input.memoryId, userId: user.id, deletedAt: null }, select: { id: true, version: true } });
  if (!memory) throw new Error("MEMORY_NOT_FOUND");

  if (input.decision === "CONFIRM") {
    await prisma.memory.update({ where: { id: memory.id }, data: { confirmationStatus: ConfirmationStatus.USER_CONFIRMED } });
  } else if (input.decision === "REJECT") {
    await prisma.memory.update({ where: { id: memory.id }, data: { confirmationStatus: ConfirmationStatus.USER_REJECTED } });
  } else {
    const correctedText = input.correctedText?.trim();
    if (!correctedText) throw new Error("CORRECTION_REQUIRED");
    await prisma.memory.update({
      where: { id: memory.id },
      data: { canonicalText: correctedText, confirmationStatus: ConfirmationStatus.USER_CORRECTED, confidence: 1, version: memory.version + 1 },
    });
  }
}

export async function softDeleteCurrentUserMemory(memoryId: string) {
  const user = await getCurrentUser();
  const memory = await prisma.memory.findFirst({ where: { id: memoryId, userId: user.id, deletedAt: null }, select: { id: true } });
  if (!memory) throw new Error("MEMORY_NOT_FOUND");
  await prisma.memory.update({ where: { id: memory.id }, data: { deletedAt: new Date(), status: EntityStatus.DELETED } });
}
