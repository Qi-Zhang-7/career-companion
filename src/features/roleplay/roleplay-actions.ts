"use server";

import { revalidatePath } from "next/cache";
import type { RoleplayActionResult, RoleplayDifficulty } from "@/features/roleplay/roleplay-types";
import { createCurrentRoleplaySession, finishCurrentRoleplaySession, sendCurrentRoleplayMessage } from "@/server/repositories/roleplay-repository";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const difficulties = new Set<RoleplayDifficulty>(["EASY", "NORMAL", "HARD"]);

export async function createRoleplay(formData: FormData): Promise<RoleplayActionResult> {
  const personId = text(formData, "personId");
  const scenario = text(formData, "scenario");
  const userGoal = text(formData, "userGoal");
  const personaStyle = text(formData, "personaStyle") || "结果导向";
  const difficultyValue = text(formData, "difficulty") as RoleplayDifficulty;
  if (!personId) return { status: "error", message: "请先选择一个真实人物。" };
  if (scenario.length < 4 || scenario.length > 500) return { status: "error", message: "请用 4–500 个字描述场景。" };
  if (userGoal.length < 4 || userGoal.length > 300) return { status: "error", message: "请用 4–300 个字写清本次目标。" };
  const difficulty = difficulties.has(difficultyValue) ? difficultyValue : "NORMAL";
  try {
    const session = await createCurrentRoleplaySession({ personId, scenario, userGoal, personaStyle, difficulty });
    revalidatePath("/roleplay");
    return { status: "success", message: "模拟已创建。", session };
  } catch (error) {
    console.error("Failed to create roleplay", error);
    return { status: "error", message: "模拟暂时没有创建成功，请稍后再试。" };
  }
}

export async function sendRoleplayMessage(formData: FormData): Promise<RoleplayActionResult> {
  const sessionId = text(formData, "sessionId");
  const content = text(formData, "content");
  if (!sessionId || !content) return { status: "error", message: "请先写下你的回应。" };
  if (content.length > 2000) return { status: "error", message: "单次回应请控制在 2000 个字以内。" };
  try {
    const messages = await sendCurrentRoleplayMessage(sessionId, content);
    revalidatePath("/roleplay");
    return { status: "success", message: "", ...messages };
  } catch (error) {
    console.error("Failed to send roleplay message", error);
    return { status: "error", message: "回应暂时没有保存成功，请稍后再试。" };
  }
}

export async function finishRoleplay(formData: FormData): Promise<RoleplayActionResult> {
  const sessionId = text(formData, "sessionId");
  if (!sessionId) return { status: "error", message: "没有找到当前模拟。" };
  try {
    const review = await finishCurrentRoleplaySession(sessionId);
    revalidatePath("/roleplay");
    return { status: "success", message: "模拟已结束，复盘已保存。", review };
  } catch (error) {
    console.error("Failed to finish roleplay", error);
    return { status: "error", message: "模拟暂时没有结束成功，请稍后再试。" };
  }
}
