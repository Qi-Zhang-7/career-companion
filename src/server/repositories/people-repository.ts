import { ConfirmationStatus, EvidenceKind } from "@/generated/prisma/enums";
import { prisma } from "@/server/db/prisma";
import { CURRENT_DEMO_USER_EMAIL } from "@/server/repositories/current-user-repository";
import type { PeoplePageData } from "@/features/people/people-types";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", timeZone: "Asia/Shanghai" });

async function getCurrentUserId() {
  const user = await prisma.user.findUnique({ where: { email: CURRENT_DEMO_USER_EMAIL }, select: { id: true } });
  if (!user) throw new Error("CURRENT_USER_NOT_FOUND");
  return user.id;
}

export async function getCurrentPeoplePageData(): Promise<PeoplePageData | null> {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: {
      displayName: true,
      careerProfile: { select: { currentRole: true } },
      people: {
        where: { deletedAt: null },
        orderBy: [{ groupType: "asc" }, { createdAt: "asc" }],
        include: {
          relationships: { orderBy: { updatedAt: "desc" }, take: 1 },
          observations: { where: { deletedAt: null }, orderBy: [{ kind: "asc" }, { updatedAt: "desc" }] },
          communicationStrategies: { orderBy: { updatedAt: "desc" } },
          workEventPeople: {
            orderBy: { workEvent: { occurredAt: "desc" } },
            take: 5,
            include: { workEvent: { select: { id: true, title: true, occurredAt: true, facts: true, outcome: true } } },
          },
        },
      },
    },
  });

  if (!user) return null;
  const people = user.people.map((person) => ({
      id: person.id,
      displayName: person.displayName,
      roleTitle: person.roleTitle,
      groupType: person.groupType,
      organizationAlias: person.organizationAlias,
      notes: person.notes,
      relationship: person.relationships[0] ? {
        id: person.relationships[0].id,
        relationshipType: person.relationships[0].relationshipType,
        closeness: person.relationships[0].closeness,
        influenceLevel: person.relationships[0].influenceLevel,
        communicationSummary: person.relationships[0].communicationSummary,
      } : null,
      observations: person.observations.map((observation) => ({
        id: observation.id,
        kind: observation.kind,
        content: observation.content,
        confidence: observation.confidence,
        confirmationStatus: observation.confirmationStatus,
        evidenceCount: observation.evidenceCount,
        counterEvidenceCount: observation.counterEvidenceCount,
        sourceType: observation.sourceType,
      })),
      strategies: person.communicationStrategies.map((strategy) => ({
        id: strategy.id,
        context: strategy.context,
        strategy: strategy.strategy,
        status: strategy.status,
        evidenceCount: strategy.evidenceCount,
      })),
      events: person.workEventPeople.map((link) => ({
        id: link.workEvent.id,
        title: link.workEvent.title,
        date: dateFormatter.format(link.workEvent.occurredAt),
        roleInEvent: link.roleInEvent,
        facts: link.workEvent.facts,
        outcome: link.workEvent.outcome,
      })),
    }));
  people.sort((left, right) =>
    right.events.length - left.events.length
    || (right.relationship?.influenceLevel ?? 0) - (left.relationship?.influenceLevel ?? 0),
  );

  return {
    currentUser: { displayName: user.displayName, currentRole: user.careerProfile?.currentRole ?? null },
    people,
  };
}

export type PersonEditorInput = {
  personId: string | null;
  displayName: string;
  roleTitle: string | null;
  groupType: string | null;
  organizationAlias: string | null;
  notes: string | null;
  relationshipType: string;
  influenceLevel: number | null;
  communicationSummary: string | null;
  strategyContext: string | null;
  strategy: string | null;
  observationKind: EvidenceKind | null;
  observationContent: string | null;
};

export async function saveCurrentUserPerson(input: PersonEditorInput) {
  const userId = await getCurrentUserId();
  return prisma.$transaction(async (tx) => {
    let personId = input.personId;
    if (personId) {
      const owned = await tx.person.findFirst({ where: { id: personId, userId, deletedAt: null }, select: { id: true } });
      if (!owned) throw new Error("PERSON_NOT_FOUND");
      await tx.person.update({
        where: { id: personId },
        data: {
          displayName: input.displayName,
          roleTitle: input.roleTitle,
          groupType: input.groupType,
          organizationAlias: input.organizationAlias,
          notes: input.notes,
        },
      });
    } else {
      const created = await tx.person.create({
        data: {
          userId,
          displayName: input.displayName,
          roleTitle: input.roleTitle,
          groupType: input.groupType,
          organizationAlias: input.organizationAlias,
          notes: input.notes,
        },
      });
      personId = created.id;
    }

    const relationship = await tx.relationship.findFirst({ where: { userId, personId }, select: { id: true } });
    const relationshipData = {
      relationshipType: input.relationshipType,
      influenceLevel: input.influenceLevel,
      communicationSummary: input.communicationSummary,
    };
    if (relationship) await tx.relationship.update({ where: { id: relationship.id }, data: relationshipData });
    else await tx.relationship.create({ data: { userId, personId, ...relationshipData } });

    const currentStrategy = await tx.communicationStrategy.findFirst({ where: { personId }, orderBy: { updatedAt: "desc" }, select: { id: true } });
    if (input.strategy) {
      const strategyData = { context: input.strategyContext ?? "日常沟通", strategy: input.strategy };
      if (currentStrategy) await tx.communicationStrategy.update({ where: { id: currentStrategy.id }, data: strategyData });
      else await tx.communicationStrategy.create({ data: { personId, ...strategyData } });
    }

    if (input.observationKind && input.observationContent) {
      await tx.personObservation.create({
        data: {
          personId,
          kind: input.observationKind,
          content: input.observationContent,
          sourceType: "USER_INPUT",
          confirmationStatus: ConfirmationStatus.USER_CONFIRMED,
          confidence: 1,
        },
      });
    }
    return personId;
  });
}

export async function reviewCurrentUserObservation(input: {
  observationId: string;
  decision: "CONFIRM" | "CORRECT" | "REJECT";
  correctedContent?: string;
}) {
  const userId = await getCurrentUserId();
  const observation = await prisma.personObservation.findFirst({
    where: { id: input.observationId, deletedAt: null, person: { userId, deletedAt: null } },
    select: { id: true },
  });
  if (!observation) throw new Error("OBSERVATION_NOT_FOUND");

  if (input.decision === "CONFIRM") {
    await prisma.personObservation.update({ where: { id: observation.id }, data: { confirmationStatus: ConfirmationStatus.USER_CONFIRMED } });
  } else if (input.decision === "REJECT") {
    await prisma.personObservation.update({ where: { id: observation.id }, data: { confirmationStatus: ConfirmationStatus.USER_REJECTED } });
  } else {
    const correctedContent = input.correctedContent?.trim();
    if (!correctedContent) throw new Error("CORRECTION_REQUIRED");
    await prisma.personObservation.update({
      where: { id: observation.id },
      data: { content: correctedContent, confirmationStatus: ConfirmationStatus.USER_CORRECTED, confidence: 1 },
    });
  }
}

export async function softDeleteCurrentUserPerson(personId: string) {
  const userId = await getCurrentUserId();
  const person = await prisma.person.findFirst({ where: { id: personId, userId, deletedAt: null }, select: { id: true } });
  if (!person) throw new Error("PERSON_NOT_FOUND");
  await prisma.person.update({ where: { id: person.id }, data: { deletedAt: new Date() } });
}
