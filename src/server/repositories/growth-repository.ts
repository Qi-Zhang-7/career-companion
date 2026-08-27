import { prisma } from "@/server/db/prisma";
import type { GrowthPageData, GrowthReportView, GrowthThemeView } from "@/features/growth/growth-types";
import { CURRENT_DEMO_USER_EMAIL } from "@/server/repositories/current-user-repository";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", timeZone: "Asia/Shanghai" });
const monthFormatter = new Intl.DateTimeFormat("zh-CN", { month: "long", timeZone: "Asia/Shanghai" });

export async function getGrowthPageData(): Promise<GrowthPageData | null> {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: {
      id: true,
      displayName: true,
      growthThemes: {
        where: { deletedAt: null },
        orderBy: [{ status: "asc" }, { lastSeenAt: "desc" }],
        include: { links: { orderBy: { createdAt: "asc" } } },
      },
      growthReports: {
        orderBy: [{ periodStart: "asc" }, { version: "asc" }],
        include: { themes: true, evidence: { orderBy: { occurredAt: "asc" } } },
      },
      interactionModels: {
        where: { status: "USER_CONFIRMED" },
        include: { person: { select: { displayName: true } } },
        take: 1,
      },
    },
  });
  if (!user) return null;

  const eventIds = [...new Set(user.growthThemes.flatMap((theme) => theme.links.filter((link) => link.entityType === "WORK_EVENT").map((link) => link.entityId)))];
  const events = await prisma.workEvent.findMany({
    where: { id: { in: eventIds }, userId: user.id, deletedAt: null },
    include: { dynamics: true, people: { include: { person: { select: { displayName: true } } } } },
    orderBy: { occurredAt: "asc" },
  });
  const eventMap = new Map(events.map((event) => [event.id, event]));

  const themes: GrowthThemeView[] = user.growthThemes.map((theme) => ({
    id: theme.id,
    title: theme.title,
    description: theme.description,
    status: theme.status,
    source: theme.source,
    confirmationStatus: theme.confirmationStatus,
    originSummary: theme.originSummary,
    evidenceCount: theme.links.length,
    timeline: theme.links
      .map((link) => eventMap.get(link.entityId))
      .filter((event): event is NonNullable<typeof event> => Boolean(event))
      .map((event) => ({
        id: event.id,
        date: dateFormatter.format(event.occurredAt),
        month: monthFormatter.format(event.occurredAt),
        title: event.title,
        facts: event.facts,
        response: event.dynamics?.userResponse ?? null,
        outcome: event.outcome,
        people: event.people.map((item) => item.person.displayName),
      })),
  }));

  const reports: GrowthReportView[] = user.growthReports.map((report) => {
    const snapshot = report.themes[0] ?? null;
    return {
      id: report.id,
      month: monthFormatter.format(report.periodStart),
      period: `${dateFormatter.format(report.periodStart)} — ${dateFormatter.format(report.periodEnd)}`,
      status: report.status,
      version: report.version,
      confirmedAt: report.confirmedAt ? dateFormatter.format(report.confirmedAt) : null,
      summary: report.summarySnapshot,
      nextFocus: report.nextFocusSnapshot,
      theme: snapshot ? {
        title: snapshot.themeTitleSnapshot,
        status: snapshot.themeStatusSnapshot,
        pastPattern: snapshot.pastPatternSnapshot,
        recentPattern: snapshot.recentPatternSnapshot,
        effectiveStrategy: snapshot.effectiveStrategySnapshot,
        nextExperiment: snapshot.nextExperimentSnapshot,
      } : null,
      evidence: report.evidence.map((item) => ({ text: item.evidenceSnapshot, date: dateFormatter.format(item.occurredAt) })),
    };
  });

  const interaction = user.interactionModels[0];
  return {
    userName: user.displayName,
    themes,
    reports,
    interaction: interaction ? {
      person: interaction.person?.displayName ?? null,
      internalResponse: interaction.typicalInternalResponse,
      behavior: interaction.typicalBehavior,
      outcome: interaction.typicalOutcome,
      strategy: interaction.effectiveStrategy,
    } : null,
  };
}
