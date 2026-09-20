"use server";

import { revalidatePath } from "next/cache";
import { setCurrentUserChatHistoryEnabled } from "@/server/repositories/chat-repository";

export async function toggleChatHistory(_state: { message: string }, formData: FormData) {
  const enabled = formData.get("enabled");
  if (enabled !== "true" && enabled !== "false") return { message: "设置无效，请重试。" };
  try {
    await setCurrentUserChatHistoryEnabled(enabled === "true");
    revalidatePath("/settings");
    revalidatePath("/chat");
    return { message: enabled === "true" ? "已开启聊天历史保存。" : "已关闭；新对话仅保留在当前页面。" };
  } catch {
    return { message: "设置没有保存成功，请重试。" };
  }
}
import type { MemoryFormState } from "@/features/settings/settings-types";
import { createCurrentUserMemory, reviewCurrentUserMemory, setCurrentUserMemoryEnabled, softDeleteCurrentUserMemory } from "@/server/repositories/memory-repository";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export async function toggleMemory(formData: FormData) {
  await setCurrentUserMemoryEnabled(text(formData, "enabled") === "true");
  revalidatePath("/settings");
}

export async function createMemory(_state: MemoryFormState, formData: FormData): Promise<MemoryFormState> {
  const canonicalText = text(formData, "canonicalText");
  const type = text(formData, "type") || "OTHER";
  const certainty = text(formData, "certainty") || "FACT";
  const sensitivity = text(formData, "sensitivity") || "NORMAL";
  const importance = Number(text(formData, "importance") || "1");
  const fieldErrors: Record<string, string> = {};
  if (!canonicalText) fieldErrors.canonicalText = "请填写希望长期记住的内容。";
  if (canonicalText.length > 800) fieldErrors.canonicalText = "记忆内容请控制在 800 个字以内。";
  if (!Number.isInteger(importance) || importance < 1 || importance > 5) fieldErrors.importance = "重要程度请选择 1–5。";
  if (Object.keys(fieldErrors).length > 0) return { status: "error", message: "有几项内容需要调整。", fieldErrors };

  try {
    const savedMemoryId = await createCurrentUserMemory({ type, canonicalText, certainty, sensitivity, importance });
    revalidatePath("/settings");
    return { status: "success", message: "这条记忆已保存并标记为你主动确认。", savedMemoryId };
  } catch (error) {
    console.error("Failed to create memory", error);
    return { status: "error", message: "暂时没有保存成功，请稍后再试。" };
  }
}

export async function reviewMemory(_state: MemoryFormState, formData: FormData): Promise<MemoryFormState> {
  const memoryId = text(formData, "memoryId");
  const decision = text(formData, "decision");
  const correctedText = text(formData, "correctedText");
  if (!memoryId || !["CONFIRM", "CORRECT", "REJECT"].includes(decision)) return { status: "error", message: "无法识别这次操作。" };
  if (decision === "CORRECT" && !correctedText) return { status: "error", message: "请填写更准确的记忆表述。" };
  if (correctedText.length > 800) return { status: "error", message: "记忆内容请控制在 800 个字以内。" };

  try {
    await reviewCurrentUserMemory({ memoryId, decision: decision as "CONFIRM" | "CORRECT" | "REJECT", correctedText });
    revalidatePath("/settings");
    return { status: "success", message: decision === "REJECT" ? "这条记忆已被拒绝。" : "你的判断已保存。" };
  } catch (error) {
    console.error("Failed to review memory", error);
    return { status: "error", message: "暂时没有保存成功，请稍后再试。" };
  }
}

export async function deleteMemory(formData: FormData) {
  const memoryId = text(formData, "memoryId");
  if (!memoryId) return;
  await softDeleteCurrentUserMemory(memoryId);
  revalidatePath("/settings");
}
