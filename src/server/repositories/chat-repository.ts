import { ConversationMode, EntityStatus, MessageRole } from "@/generated/prisma/enums";
import { prisma } from "@/server/db/prisma";
import { CURRENT_DEMO_USER_EMAIL } from "@/server/repositories/current-user-repository";
import type { ChatMode, ChatPageData } from "@/features/chat/chat-types";

const timeFormatter = new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" });
const mockResponses: Record<ChatMode, string> = {
  LISTENING: "听起来这件事已经让你绷了一阵子。我们先不急着解决——刚才发生的哪一个瞬间，最让你觉得累？",
  COACHING: "我们先把事实和担心分开一点。此刻已经确定发生了什么？你最担心对方会怎样理解这件事？",
  ADVICE: "可以先用“现状 + 已完成 + 依赖 + 下一步 + 时间点”回应。先把共同目标放在前面，再说明限制和可交付节点。",
  ROLEPLAY: "好，我们先练最难的开场。我会留在对方角色中：——“这个节点之前已经确认过了，为什么现在才告诉我还有依赖？”",
};

async function getCurrentUserId() {
  const user = await prisma.user.findUnique({ where: { email: CURRENT_DEMO_USER_EMAIL }, select: { id: true } });
  if (!user) throw new Error("CURRENT_USER_NOT_FOUND");
  return user.id;
}

const mapMessage = (message: { id: string; role: MessageRole; content: string; mode: ConversationMode | null; sequenceNo: number; createdAt: Date }) => ({
  id: message.id,
  role: message.role,
  content: message.content,
  mode: message.mode,
  sequenceNo: message.sequenceNo,
  createdAt: timeFormatter.format(message.createdAt),
});

export async function getCurrentChatPageData(): Promise<ChatPageData | null> {
  const user = await prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: {
      displayName: true,
      chatHistoryEnabled: true,
      conversations: {
        where: { deletedAt: null },
        orderBy: { startedAt: "desc" },
        take: 20,
        include: { messages: { orderBy: { sequenceNo: "asc" } } },
      },
    },
  });
  if (!user) return null;
  return {
    userName: user.displayName,
    chatHistoryEnabled: user.chatHistoryEnabled,
    conversations: user.conversations.map((conversation) => ({
      id: conversation.id,
      mode: conversation.mode,
      title: conversation.title,
      status: conversation.status,
      summary: conversation.summary,
      startedAt: timeFormatter.format(conversation.startedAt),
      endedAt: conversation.endedAt ? timeFormatter.format(conversation.endedAt) : null,
      messages: conversation.messages.map(mapMessage),
    })),
  };
}

export async function sendCurrentUserChatMessage(input: { conversationId: string | null; mode: ChatMode; content: string; saveHistory?: boolean }) {
  return sendUserChatMessage(await getCurrentUserId(), input);
}

export async function sendUserChatMessage(userId: string, input: { conversationId: string | null; mode: ChatMode; content: string; saveHistory?: boolean }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.chatHistoryEnabled || input.saveHistory === false) {
    if (input.conversationId) throw new Error("HISTORY_DISABLED_START_NEW");
    const now = new Date();
    return {
      persisted: false,
      conversationId: `local-${crypto.randomUUID()}`,
      title: input.content.slice(0, 28),
      userMessage: mapMessage({ id: crypto.randomUUID(), role: MessageRole.USER, content: input.content, mode: input.mode, sequenceNo: 0, createdAt: now }),
      assistantMessage: mapMessage({ id: crypto.randomUUID(), role: MessageRole.ASSISTANT, content: mockResponses[input.mode], mode: input.mode, sequenceNo: 0, createdAt: now }),
    };
  }
  return prisma.$transaction(async (tx) => {
    let conversationId = input.conversationId;
    let conversation = conversationId ? await tx.conversation.findFirst({ where: { id: conversationId, userId, deletedAt: null }, include: { messages: { orderBy: { sequenceNo: "desc" }, take: 1 } } }) : null;
    if (conversationId && !conversation) throw new Error("CONVERSATION_NOT_FOUND");
    if (!conversation) {
      conversation = await tx.conversation.create({
        data: { userId, mode: input.mode as ConversationMode, title: input.content.slice(0, 28), messages: { create: { role: MessageRole.ASSISTANT, content: "我在。你不用先把事情想清楚，慢慢说就好。", mode: input.mode as ConversationMode, sequenceNo: 1 } } },
        include: { messages: { orderBy: { sequenceNo: "desc" }, take: 1 } },
      });
      conversationId = conversation.id;
    }
    const persistedConversationId = conversation.id;
    const nextSequence = (conversation.messages[0]?.sequenceNo ?? 0) + 1;
    const [userMessage, assistantMessage] = await Promise.all([
      tx.conversationMessage.create({ data: { conversationId: persistedConversationId, role: MessageRole.USER, content: input.content, mode: input.mode as ConversationMode, sequenceNo: nextSequence } }),
      tx.conversationMessage.create({ data: { conversationId: persistedConversationId, role: MessageRole.ASSISTANT, content: mockResponses[input.mode], mode: input.mode as ConversationMode, model: "mock", promptVersion: "mock-chat-v1", sequenceNo: nextSequence + 1 } }),
    ]);
    await tx.conversation.update({ where: { id: persistedConversationId }, data: { mode: input.mode as ConversationMode, status: EntityStatus.ACTIVE } });
    return { persisted: true, conversationId: persistedConversationId, title: conversation.title ?? input.content.slice(0, 28), userMessage: mapMessage(userMessage), assistantMessage: mapMessage(assistantMessage) };
  });
}

export async function setCurrentUserChatHistoryEnabled(enabled: boolean) {
  await prisma.user.update({ where: { id: await getCurrentUserId() }, data: { chatHistoryEnabled: enabled } });
}

export async function finishCurrentUserConversation(conversationId: string) {
  const userId = await getCurrentUserId();
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, userId, deletedAt: null }, include: { messages: { where: { role: MessageRole.USER }, orderBy: { sequenceNo: "asc" } } } });
  if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");
  const userPoints = conversation.messages.slice(0, 3).map((message) => message.content.trim()).filter(Boolean);
  const summary = userPoints.length > 0
    ? `本次主要讨论“${conversation.title ?? "一件职场经历"}”。用户提到：${userPoints.join("；").slice(0, 280)}。这是规则生成的会话概要，尚未形成长期记忆。`
    : "本次对话尚未记录具体内容。";
  await prisma.conversation.update({ where: { id: conversation.id }, data: { summary, endedAt: new Date(), status: EntityStatus.ARCHIVED } });
  return summary;
}

export async function deleteCurrentUserConversation(conversationId: string) {
  const userId = await getCurrentUserId();
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, userId, deletedAt: null }, select: { id: true } });
  if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");
  await prisma.conversation.update({ where: { id: conversation.id }, data: { deletedAt: new Date(), status: EntityStatus.DELETED } });
}

export async function softDeleteAllUserConversations(userId: string) {
  const result = await prisma.conversation.updateMany({
    where: { userId, deletedAt: null },
    data: { deletedAt: new Date(), status: EntityStatus.DELETED },
  });
  return result.count;
}

export async function clearCurrentUserConversationHistory() {
  return softDeleteAllUserConversations(await getCurrentUserId());
}
