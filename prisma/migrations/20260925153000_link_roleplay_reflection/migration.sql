ALTER TABLE "Reflection"
ADD COLUMN "roleplaySessionId" UUID,
ADD COLUMN "userFeeling" TEXT;

CREATE UNIQUE INDEX "Reflection_roleplaySessionId_key"
ON "Reflection"("roleplaySessionId");

ALTER TABLE "Reflection"
ADD CONSTRAINT "Reflection_roleplaySessionId_fkey"
FOREIGN KEY ("roleplaySessionId") REFERENCES "RoleplaySession"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

COMMENT ON COLUMN "Reflection"."roleplaySessionId" IS '来源模拟会话 ID；每次模拟最多对应一份正式复盘';
COMMENT ON COLUMN "Reflection"."userFeeling" IS '用户确认的感受、担心或最困难之处，不作为客观事实';
