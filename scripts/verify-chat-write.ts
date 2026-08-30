import "dotenv/config";
import { prisma } from "../src/server/db/prisma";
import { deleteCurrentUserConversation, finishCurrentUserConversation, getCurrentChatPageData, sendCurrentUserChatMessage } from "../src/server/repositories/chat-repository";

const marker = `CHAT_WRITE_CHECK_${Date.now()}`;
let conversationId: string | null = null;

async function main() {
  const sent = await sendCurrentUserChatMessage({ conversationId: null, mode: "COACHING", content: marker });
  conversationId = sent.conversationId;
  const created = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { messages: { orderBy: { sequenceNo: "asc" } } } });
  if (!created || created.messages.length !== 3 || created.messages[1]?.content !== marker || created.messages[2]?.model !== "mock") {
    throw new Error("Chat write verification failed");
  }
  const summary = await finishCurrentUserConversation(conversationId);
  const finished = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!finished || finished.status !== "ARCHIVED" || !finished.endedAt || finished.summary !== summary) {
    throw new Error("Chat finish verification failed");
  }
  await deleteCurrentUserConversation(conversationId);
  const deleted = await prisma.conversation.findUnique({ where: { id: conversationId } });
  const pageData = await getCurrentChatPageData();
  if (!deleted?.deletedAt || deleted.status !== "DELETED" || pageData?.conversations.some((conversation) => conversation.id === conversationId)) {
    throw new Error("Chat soft-delete verification failed");
  }
  console.log({ writeVerified: true, messageCount: created.messages.length, archived: true, softDeleteVerified: true });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (conversationId) await prisma.conversation.delete({ where: { id: conversationId } });
    await prisma.$disconnect();
  });
