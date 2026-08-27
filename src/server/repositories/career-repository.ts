import { prisma } from "@/server/db/prisma";
import { CURRENT_DEMO_USER_EMAIL } from "@/server/repositories/current-user-repository";
import type { CareerPageData } from "@/features/career/career-types";

export type CareerProfileUpdate = {
  displayName: string;
  currentRole: string | null;
  industry: string | null;
  companyType: string | null;
  companyAlias: string | null;
  city: string | null;
  yearsExperience: number | null;
  teamName: string | null;
  teamSize: number | null;
  managerTitle: string | null;
  careerStage: string | null;
  goals: Record<"SHORT" | "MID" | "LONG", string>;
};

export async function getCurrentCareerPageData(): Promise<CareerPageData | null> {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: {
      displayName: true,
      email: true,
      careerProfile: true,
      careerGoals: { orderBy: { createdAt: "asc" } },
      growthThemes: {
        where: { deletedAt: null, status: { notIn: ["REJECTED", "RESOLVED"] } },
        orderBy: { lastSeenAt: "desc" },
        take: 3,
      },
      selfModelEntries: {
        where: { validTo: null, confirmationStatus: { in: ["USER_CONFIRMED", "USER_CORRECTED"] } },
        orderBy: [{ evidenceCount: "desc" }, { updatedAt: "desc" }],
        take: 4,
      },
    },
  });

  if (!user) return null;
  const profile = user.careerProfile;

  return {
    profile: {
      displayName: user.displayName,
      email: user.email,
      currentRole: profile?.currentRole ?? null,
      industry: profile?.industry ?? null,
      companyType: profile?.companyType ?? null,
      companyAlias: profile?.companyAlias ?? null,
      city: profile?.city ?? null,
      yearsExperience: profile?.yearsExperience ?? null,
      teamName: profile?.teamName ?? null,
      teamSize: profile?.teamSize ?? null,
      managerTitle: profile?.managerTitle ?? null,
      careerStage: profile?.careerStage ?? null,
      profileCompleteness: profile?.profileCompleteness ?? 0,
    },
    goals: user.careerGoals.map((goal) => ({
      id: goal.id,
      horizon: goal.horizon,
      title: goal.title,
      description: goal.description,
      status: goal.status,
    })),
    themes: user.growthThemes.map((theme) => ({
      id: theme.id,
      title: theme.title,
      description: theme.description,
      status: theme.status,
    })),
    selfModel: user.selfModelEntries.map((entry) => ({
      id: entry.id,
      category: entry.category,
      statement: entry.statement,
      evidenceCount: entry.evidenceCount,
      confirmationStatus: entry.confirmationStatus,
    })),
  };
}

export async function updateCurrentCareerProfile(input: CareerProfileUpdate) {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: { id: true, careerGoals: { select: { id: true, horizon: true } } },
  });
  if (!user) throw new Error("CURRENT_USER_NOT_FOUND");

  const profileValues = [
    input.currentRole,
    input.industry,
    input.companyType,
    input.companyAlias,
    input.city,
    input.yearsExperience,
    input.teamName,
    input.teamSize,
    input.managerTitle,
    input.careerStage,
  ];
  const completed = profileValues.filter((value) => value !== null && value !== "").length;
  const profileCompleteness = Math.round((completed / profileValues.length) * 100);
  const profileData = {
    currentRole: input.currentRole,
    industry: input.industry,
    companyType: input.companyType,
    companyAlias: input.companyAlias,
    city: input.city,
    yearsExperience: input.yearsExperience,
    teamName: input.teamName,
    teamSize: input.teamSize,
    managerTitle: input.managerTitle,
    careerStage: input.careerStage,
    profileCompleteness,
  };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { displayName: input.displayName } });
    await tx.careerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...profileData },
      update: profileData,
    });

    for (const horizon of ["SHORT", "MID", "LONG"] as const) {
      const existing = user.careerGoals.find((goal) => goal.horizon === horizon);
      const title = input.goals[horizon].trim() || "还不清楚";
      const status = input.goals[horizon].trim() ? "ACTIVE" : "UNCLEAR";
      if (existing) {
        await tx.careerGoal.update({ where: { id: existing.id }, data: { title, status } });
      } else {
        await tx.careerGoal.create({ data: { userId: user.id, horizon, title, status } });
      }
    }
  });
}
