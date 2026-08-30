"use server";

import { revalidatePath } from "next/cache";
import type { ChatActionResult, ChatMode } from "@/features/chat/chat-types";
import { clearCurrentUserConversationHistory, deleteCurrentUserConversation, finishCurrentUserConversation, sendCurrentUserChatMessage } from "@/server/repositories/chat-repository";

const allowedModes = new Set<ChatMode>(["LISTENING", "COACHING", "ADVICE", "ROLEPLAY"]);

export async function sendChatMessage(formData: FormData): Promise<ChatActionResult> {
  const content = String(formData.get("content") ?? "").trim();
  const conversationId = String(formData.get("conversationId") ?? "").trim() || null;
  const modeValue = String(formData.get("mode") ?? "LISTENING") as ChatMode;
  if (!content) return { status: "error", message: "先写一点你想说的内容。" };
  if (content.length > 4000) return { status: "error", message: "单条消息请控制在 4000 个字以内。" };
  const mode = allowedModes.has(modeValue) ? modeValue : "LISTENING";
  try {
    const result = await sendCurrentUserChatMessage({ conversationId, mode, content });
    revalidatePath("/chat");
    return { status: "success", message: "", ...result };
  } catch (error) {
    console.error("Failed to send chat message", error);
    return { status: "error", message: "消息暂时没有保存成功，请稍后再试。" };
  }
}

export async function finishConversation(formData: FormData): Promise<ChatActionResult> {
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  if (!conversationId) return { status: "error", message: "当前还没有可以结束的对话。" };
  try {
    const summary = await finishCurrentUserConversation(conversationId);
    revalidatePath("/chat");
    return { status: "success", message: "对话已结束并生成概要。", conversationId, summary };
  } catch (error) {
    console.error("Failed to finish conversation", error);
    return { status: "error", message: "暂时没有结束成功，请稍后再试。" };
  }
}

export async function deleteConversation(formData: FormData): Promise<ChatActionResult> {
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  if (!conversationId) return { status: "error", message: "没有找到需要删除的会话。" };
  try {
    await deleteCurrentUserConversation(conversationId);
    revalidatePath("/chat");
    return { status: "success", message: "会话已删除。", conversationId };
  } catch (error) {
    console.error("Failed to delete conversation", error);
    return { status: "error", message: "会话暂时没有删除成功，请稍后再试。" };
  }
}

export async function clearConversationHistory(): Promise<ChatActionResult> {
  try {
    const deletedCount = await clearCurrentUserConversationHistory();
    revalidatePath("/chat");
    return { status: "success", message: deletedCount > 0 ? `已清空 ${deletedCount} 段会话。` : "当前没有需要清空的会话。", deletedCount };
  } catch (error) {
    console.error("Failed to clear conversation history", error);
    return { status: "error", message: "会话历史暂时没有清空成功，请稍后再试。" };
  }
}
