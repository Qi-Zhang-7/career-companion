"use server";

import { revalidatePath } from "next/cache";
import type { ReflectionFormState } from "@/features/reflection/reflection-types";
import { saveCurrentRoleplayReflection } from "@/server/repositories/reflection-repository";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export async function saveRoleplayReflection(
  _previousState: ReflectionFormState,
  formData: FormData,
): Promise<ReflectionFormState> {
  const roleplaySessionId = text(formData, "roleplaySessionId");
  const fields = {
    goalSelf: text(formData, "goalSelf"),
    goalOther: text(formData, "goalOther"),
    whatHappened: text(formData, "whatHappened"),
    userFeeling: text(formData, "userFeeling"),
    workedWell: text(formData, "workedWell"),
    improvements: text(formData, "improvements"),
    nextExperiment: text(formData, "nextExperiment"),
  };
  const fieldErrors: Record<string, string> = {};
  if (!roleplaySessionId) fieldErrors.roleplaySessionId = "没有找到本次模拟练习。";
  if (fields.whatHappened.length < 4) fieldErrors.whatHappened = "请至少用一句话记录模拟中发生了什么。";
  if (fields.nextExperiment.length < 4) fieldErrors.nextExperiment = "请写下一个足够具体的下次尝试。";
  for (const [key, value] of Object.entries(fields)) {
    if (value.length > 2000) fieldErrors[key] = "每项请控制在 2000 个字以内。";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "有几项内容需要补充或调整。", fieldErrors };
  }
  try {
    const reflection = await saveCurrentRoleplayReflection({ roleplaySessionId, ...fields });
    revalidatePath("/reflection");
    revalidatePath("/roleplay");
    return { status: "success", message: "这次复盘已经保存。再次修改会更新同一份记录。", reflection };
  } catch (error) {
    console.error("Failed to save roleplay reflection", error);
    return { status: "error", message: "复盘暂时没有保存成功，请稍后再试。" };
  }
}
