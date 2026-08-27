"use server";

import { revalidatePath } from "next/cache";
import type { CareerFormState } from "@/features/career/career-types";
import { updateCurrentCareerProfile } from "@/server/repositories/career-repository";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const optionalText = (formData: FormData, key: string) => text(formData, key) || null;

function optionalInteger(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

export async function saveCareerProfile(
  _previousState: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  const displayName = text(formData, "displayName");
  const yearsExperience = optionalInteger(formData, "yearsExperience");
  const teamSize = optionalInteger(formData, "teamSize");
  const fieldErrors: Record<string, string> = {};

  if (!displayName) fieldErrors.displayName = "请填写你希望在产品中使用的称呼。";
  if (displayName.length > 30) fieldErrors.displayName = "称呼请控制在 30 个字以内。";
  if (Number.isNaN(yearsExperience) || (yearsExperience !== null && (yearsExperience < 0 || yearsExperience > 60))) {
    fieldErrors.yearsExperience = "工作年限请填写 0–60 之间的整数。";
  }
  if (Number.isNaN(teamSize) || (teamSize !== null && (teamSize < 0 || teamSize > 10000))) {
    fieldErrors.teamSize = "团队人数请填写 0–10000 之间的整数。";
  }

  const limitedFields = [
    "currentRole", "industry", "companyType", "companyAlias", "city",
    "teamName", "managerTitle", "careerStage", "goalShort", "goalMid", "goalLong",
  ];
  for (const key of limitedFields) {
    if (text(formData, key).length > 120) fieldErrors[key] = "请控制在 120 个字以内。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "有几项内容需要调整。", fieldErrors };
  }

  try {
    await updateCurrentCareerProfile({
      displayName,
      currentRole: optionalText(formData, "currentRole"),
      industry: optionalText(formData, "industry"),
      companyType: optionalText(formData, "companyType"),
      companyAlias: optionalText(formData, "companyAlias"),
      city: optionalText(formData, "city"),
      yearsExperience,
      teamName: optionalText(formData, "teamName"),
      teamSize,
      managerTitle: optionalText(formData, "managerTitle"),
      careerStage: optionalText(formData, "careerStage"),
      goals: {
        SHORT: text(formData, "goalShort"),
        MID: text(formData, "goalMid"),
        LONG: text(formData, "goalLong"),
      },
    });
    revalidatePath("/");
    revalidatePath("/career");
    revalidatePath("/growth");
    revalidatePath("/settings");
    return { status: "success", message: "职业档案已保存，其他页面也会使用最新资料。" };
  } catch (error) {
    console.error("Failed to save career profile", error);
    return { status: "error", message: "暂时没有保存成功，请稍后再试。" };
  }
}
