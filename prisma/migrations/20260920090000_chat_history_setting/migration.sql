ALTER TABLE "User" ADD COLUMN "chatHistoryEnabled" BOOLEAN NOT NULL DEFAULT true;
COMMENT ON COLUMN "User"."chatHistoryEnabled" IS '是否保存新聊天历史；关闭时新对话只保留在当前页面，已有历史不删除';
