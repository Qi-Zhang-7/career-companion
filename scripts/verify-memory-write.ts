import "dotenv/config";
import { prisma } from "../src/server/db/prisma";
import { createCurrentUserMemory } from "../src/server/repositories/memory-repository";

const marker = `SETTINGS_WRITE_CHECK_${Date.now()}`;
let memoryId: string | null = null;

async function main() {
  memoryId = await createCurrentUserMemory({
    type: "SYSTEM_CHECK",
    canonicalText: marker,
    certainty: "FACT",
    sensitivity: "NORMAL",
    importance: 1,
  });
  const created = await prisma.memory.findUnique({ where: { id: memoryId }, select: { canonicalText: true, confirmationStatus: true } });
  if (!created || created.canonicalText !== marker || created.confirmationStatus !== "USER_CONFIRMED") {
    throw new Error("Memory write verification failed");
  }
  console.log({ writeVerified: true, confirmationStatus: created.confirmationStatus });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (memoryId) await prisma.memory.delete({ where: { id: memoryId } });
    await prisma.$disconnect();
  });
