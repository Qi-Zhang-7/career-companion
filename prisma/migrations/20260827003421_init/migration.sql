-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('AUTO_RECORDED', 'PENDING_EVIDENCE', 'PENDING_CONFIRMATION', 'USER_CONFIRMED', 'USER_CORRECTED', 'USER_REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "EvidenceKind" AS ENUM ('FACT', 'OBSERVATION', 'INFERENCE', 'USER_FEELING', 'COMMUNICATION_PREFERENCE', 'EFFECTIVE_STRATEGY');

-- CreateEnum
CREATE TYPE "GrowthThemeStatus" AS ENUM ('EMERGING', 'PENDING_CONFIRMATION', 'ACTIVE', 'IMPROVING', 'DORMANT', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GrowthThemeSource" AS ENUM ('USER_CREATED', 'AI_SUGGESTED', 'CO_CREATED', 'REFLECTION_DERIVED');

-- CreateEnum
CREATE TYPE "ConversationMode" AS ENUM ('LISTENING', 'COACHING', 'ADVICE', 'ROLEPLAY', 'REFLECTION', 'CAREER', 'SAFETY');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "displayName" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'zh-CN',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "memoryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "consentVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "currentRole" TEXT,
    "industry" TEXT,
    "companyType" TEXT,
    "companyAlias" TEXT,
    "city" TEXT,
    "yearsExperience" INTEGER,
    "salaryRangeEncrypted" TEXT,
    "teamName" TEXT,
    "teamSize" INTEGER,
    "managerTitle" TEXT,
    "careerStage" TEXT,
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGoal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "horizon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "targetDate" TIMESTAMP(3),
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthTheme" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "GrowthThemeStatus" NOT NULL DEFAULT 'EMERGING',
    "source" "GrowthThemeSource" NOT NULL,
    "originSummary" TEXT,
    "confidence" DOUBLE PRECISION,
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GrowthTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthThemeLink" (
    "id" UUID NOT NULL,
    "growthThemeId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "relationType" TEXT NOT NULL,
    "evidenceWeight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthThemeLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "roleTitle" TEXT,
    "groupType" TEXT,
    "organizationAlias" TEXT,
    "notes" TEXT,
    "sensitivityLevel" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "closeness" INTEGER,
    "influenceLevel" INTEGER,
    "communicationSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonObservation" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "kind" "EvidenceKind" NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING_EVIDENCE',
    "sourceType" TEXT NOT NULL,
    "sourceId" UUID,
    "evidenceCount" INTEGER NOT NULL DEFAULT 1,
    "counterEvidenceCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PersonObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationStrategy" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "context" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "effectiveness" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "mode" "ConversationMode" NOT NULL,
    "title" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "summary" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "mode" "ConversationMode",
    "model" TEXT,
    "promptVersion" TEXT,
    "tokenUsage" JSONB,
    "safetyLevel" TEXT,
    "sequenceNo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkEvent" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,
    "facts" TEXT NOT NULL,
    "userInterpretation" TEXT,
    "emotion" TEXT,
    "concern" TEXT,
    "outcome" TEXT,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDynamics" (
    "id" UUID NOT NULL,
    "workEventId" UUID NOT NULL,
    "triggerType" TEXT,
    "perceivedPressure" TEXT,
    "userNeed" TEXT,
    "userResponse" TEXT,
    "otherResponse" TEXT,
    "outcomeCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventDynamics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkEventPerson" (
    "workEventId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "roleInEvent" TEXT,

    CONSTRAINT "WorkEventPerson_pkey" PRIMARY KEY ("workEventId","personId")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sourceType" TEXT,
    "sourceId" UUID,
    "description" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'OPEN',
    "resultNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reflection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "workEventId" UUID,
    "goalSelf" TEXT,
    "goalOther" TEXT,
    "whatHappened" TEXT NOT NULL,
    "workedWell" TEXT,
    "improvements" TEXT,
    "nextExperiment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleplaySession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "personId" UUID,
    "roleTemplate" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "personaStyle" TEXT,
    "difficulty" TEXT NOT NULL,
    "userGoal" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleplaySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleplayMessage" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "sequenceNo" INTEGER NOT NULL,
    "feedbackTags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleplayMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "canonicalText" TEXT NOT NULL,
    "structuredData" JSONB,
    "certainty" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "sensitivity" TEXT NOT NULL DEFAULT 'NORMAL',
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryEvidence" (
    "id" UUID NOT NULL,
    "memoryId" UUID NOT NULL,
    "messageId" UUID,
    "sourceType" TEXT NOT NULL,
    "sourceId" UUID NOT NULL,
    "excerptHash" TEXT,
    "evidenceWeight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryLink" (
    "id" UUID NOT NULL,
    "memoryId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "relationType" TEXT NOT NULL,

    CONSTRAINT "MemoryLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInsight" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightEvidence" (
    "id" UUID NOT NULL,
    "insightId" UUID NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" UUID NOT NULL,
    "evidenceNote" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "occurredAt" TIMESTAMP(3),

    CONSTRAINT "InsightEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPattern" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "triggerSignature" JSONB NOT NULL,
    "responseSignature" JSONB NOT NULL,
    "outcomeSignature" JSONB,
    "confidence" DOUBLE PRECISION,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "counterexampleCount" INTEGER NOT NULL DEFAULT 0,
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING_EVIDENCE',
    "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelfModelEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "certainty" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING_EVIDENCE',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelfModelEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldModelEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID,
    "statement" TEXT NOT NULL,
    "certainty" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldModelEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractionModel" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "personId" UUID,
    "environmentType" TEXT,
    "triggerSignature" JSONB NOT NULL,
    "typicalInternalResponse" TEXT,
    "typicalBehavior" TEXT,
    "typicalOutcome" TEXT,
    "effectiveStrategy" TEXT,
    "confidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InteractionModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractionEvidence" (
    "id" UUID NOT NULL,
    "interactionModelId" UUID NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" UUID NOT NULL,
    "observedChange" TEXT,
    "evidenceWeight" DOUBLE PRECISION,
    "occurredAt" TIMESTAMP(3),

    CONSTRAINT "InteractionEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthReport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "periodType" "ReportPeriod" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "summarySnapshot" TEXT NOT NULL,
    "nextFocusSnapshot" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthReportTheme" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "growthThemeId" UUID,
    "themeTitleSnapshot" TEXT NOT NULL,
    "themeStatusSnapshot" TEXT NOT NULL,
    "pastPatternSnapshot" TEXT,
    "recentPatternSnapshot" TEXT,
    "effectiveStrategySnapshot" TEXT,
    "nextExperimentSnapshot" TEXT,

    CONSTRAINT "GrowthReportTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthReportEvidence" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "reportThemeId" UUID,
    "sourceType" TEXT NOT NULL,
    "sourceId" UUID NOT NULL,
    "evidenceSnapshot" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthReportEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CareerProfile_userId_key" ON "CareerProfile"("userId");

-- CreateIndex
CREATE INDEX "CareerGoal_userId_status_idx" ON "CareerGoal"("userId", "status");

-- CreateIndex
CREATE INDEX "GrowthTheme_userId_status_lastSeenAt_idx" ON "GrowthTheme"("userId", "status", "lastSeenAt" DESC);

-- CreateIndex
CREATE INDEX "GrowthThemeLink_entityType_entityId_idx" ON "GrowthThemeLink"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowthThemeLink_growthThemeId_entityType_entityId_relationT_key" ON "GrowthThemeLink"("growthThemeId", "entityType", "entityId", "relationType");

-- CreateIndex
CREATE INDEX "Person_userId_displayName_idx" ON "Person"("userId", "displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_userId_personId_relationshipType_key" ON "Relationship"("userId", "personId", "relationshipType");

-- CreateIndex
CREATE INDEX "PersonObservation_personId_kind_confirmationStatus_idx" ON "PersonObservation"("personId", "kind", "confirmationStatus");

-- CreateIndex
CREATE INDEX "Conversation_userId_startedAt_idx" ON "Conversation"("userId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMessage_conversationId_sequenceNo_key" ON "ConversationMessage"("conversationId", "sequenceNo");

-- CreateIndex
CREATE INDEX "WorkEvent_userId_occurredAt_idx" ON "WorkEvent"("userId", "occurredAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "EventDynamics_workEventId_key" ON "EventDynamics"("workEventId");

-- CreateIndex
CREATE INDEX "ActionItem_userId_status_dueAt_idx" ON "ActionItem"("userId", "status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoleplayMessage_sessionId_sequenceNo_key" ON "RoleplayMessage"("sessionId", "sequenceNo");

-- CreateIndex
CREATE INDEX "Memory_userId_type_status_idx" ON "Memory"("userId", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryEvidence_memoryId_sourceType_sourceId_key" ON "MemoryEvidence"("memoryId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "MemoryLink_entityType_entityId_idx" ON "MemoryLink"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "UserPattern_userId_status_confidence_idx" ON "UserPattern"("userId", "status", "confidence");

-- CreateIndex
CREATE INDEX "SelfModelEntry_userId_category_idx" ON "SelfModelEntry"("userId", "category");

-- CreateIndex
CREATE INDEX "WorldModelEntry_userId_entityType_idx" ON "WorldModelEntry"("userId", "entityType");

-- CreateIndex
CREATE INDEX "InteractionModel_userId_personId_environmentType_status_idx" ON "InteractionModel"("userId", "personId", "environmentType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InteractionEvidence_interactionModelId_sourceType_sourceId_key" ON "InteractionEvidence"("interactionModelId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "GrowthReport_userId_periodStart_idx" ON "GrowthReport"("userId", "periodStart" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "GrowthReport_userId_periodType_periodStart_periodEnd_versio_key" ON "GrowthReport"("userId", "periodType", "periodStart", "periodEnd", "version");

-- CreateIndex
CREATE INDEX "GrowthReportEvidence_reportId_occurredAt_idx" ON "GrowthReportEvidence"("reportId", "occurredAt");

-- AddForeignKey
ALTER TABLE "CareerProfile" ADD CONSTRAINT "CareerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerGoal" ADD CONSTRAINT "CareerGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthTheme" ADD CONSTRAINT "GrowthTheme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthThemeLink" ADD CONSTRAINT "GrowthThemeLink_growthThemeId_fkey" FOREIGN KEY ("growthThemeId") REFERENCES "GrowthTheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonObservation" ADD CONSTRAINT "PersonObservation_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationStrategy" ADD CONSTRAINT "CommunicationStrategy_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkEvent" ADD CONSTRAINT "WorkEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDynamics" ADD CONSTRAINT "EventDynamics_workEventId_fkey" FOREIGN KEY ("workEventId") REFERENCES "WorkEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkEventPerson" ADD CONSTRAINT "WorkEventPerson_workEventId_fkey" FOREIGN KEY ("workEventId") REFERENCES "WorkEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkEventPerson" ADD CONSTRAINT "WorkEventPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_workEventId_fkey" FOREIGN KEY ("workEventId") REFERENCES "WorkEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleplaySession" ADD CONSTRAINT "RoleplaySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleplaySession" ADD CONSTRAINT "RoleplaySession_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleplayMessage" ADD CONSTRAINT "RoleplayMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RoleplaySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryEvidence" ADD CONSTRAINT "MemoryEvidence_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryEvidence" ADD CONSTRAINT "MemoryEvidence_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ConversationMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryLink" ADD CONSTRAINT "MemoryLink_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInsight" ADD CONSTRAINT "UserInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightEvidence" ADD CONSTRAINT "InsightEvidence_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "UserInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPattern" ADD CONSTRAINT "UserPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelfModelEntry" ADD CONSTRAINT "SelfModelEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldModelEntry" ADD CONSTRAINT "WorldModelEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionModel" ADD CONSTRAINT "InteractionModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionModel" ADD CONSTRAINT "InteractionModel_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionEvidence" ADD CONSTRAINT "InteractionEvidence_interactionModelId_fkey" FOREIGN KEY ("interactionModelId") REFERENCES "InteractionModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthReport" ADD CONSTRAINT "GrowthReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthReportTheme" ADD CONSTRAINT "GrowthReportTheme_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "GrowthReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthReportTheme" ADD CONSTRAINT "GrowthReportTheme_growthThemeId_fkey" FOREIGN KEY ("growthThemeId") REFERENCES "GrowthTheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthReportEvidence" ADD CONSTRAINT "GrowthReportEvidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "GrowthReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthReportEvidence" ADD CONSTRAINT "GrowthReportEvidence_reportThemeId_fkey" FOREIGN KEY ("reportThemeId") REFERENCES "GrowthReportTheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
