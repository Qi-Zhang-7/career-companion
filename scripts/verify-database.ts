import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const demo = await prisma.user.findUnique({
    where: { email: "demo@career-companion.local" },
    select: {
      displayName: true,
      careerProfile: { select: { currentRole: true, industry: true } },
      _count: {
        select: {
          people: true,
          workEvents: true,
          growthThemes: true,
          interactionModels: true,
          growthReports: true,
        },
      },
      people: {
        where: { displayName: "张经理" },
        select: {
          displayName: true,
          observations: { select: { kind: true, confirmationStatus: true, evidenceCount: true } },
          communicationStrategies: { select: { status: true, evidenceCount: true } },
        },
      },
      growthThemes: {
        select: { title: true, status: true, source: true, confirmationStatus: true, _count: { select: { links: true } } },
      },
      growthReports: {
        select: { periodType: true, status: true, version: true, _count: { select: { themes: true, evidence: true } } },
      },
    },
  });

  if (!demo) throw new Error("Demo user was not found after seed");

  const kinds = new Set(demo.people.flatMap((person) => person.observations.map((item) => item.kind)));
  for (const required of ["FACT", "OBSERVATION", "INFERENCE", "USER_FEELING"]) {
    if (!kinds.has(required as never)) throw new Error(`Missing seeded evidence kind: ${required}`);
  }

  console.log(JSON.stringify(demo, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
