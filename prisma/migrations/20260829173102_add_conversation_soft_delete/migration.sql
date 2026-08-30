-- DropIndex
DROP INDEX "Conversation_userId_startedAt_idx";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Conversation_userId_deletedAt_startedAt_idx" ON "Conversation"("userId", "deletedAt", "startedAt" DESC);
