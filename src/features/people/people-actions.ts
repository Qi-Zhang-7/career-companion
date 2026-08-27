"use server";

import { revalidatePath } from "next/cache";
import { EvidenceKind } from "@/generated/prisma/enums";
import type { PeopleFormState } from "@/features/people/people-types";
import { reviewCurrentUserObservation, saveCurrentUserPerson, softDeleteCurrentUserPerson } from "@/server/repositories/people-repository";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const optional = (formData: FormData, key: string) => text(formData, key) || null;
const allowedKinds = new Set(Object.values(EvidenceKind));

export async function savePerson(_state: PeopleFormState, formData: FormData): Promise<PeopleFormState> {
  const displayName = text(formData, "displayName");
  const influenceRaw = text(formData, "influenceLevel");
  const influenceLevel = influenceRaw ? Number(influenceRaw) : null;
  const kindRaw = text(formData, "observationKind");
  const observationKind = kindRaw && allowedKinds.has(kindRaw as EvidenceKind) ? kindRaw as EvidenceKind : null;
  const observationContent = optional(formData, "observationContent");
  const fieldErrors: Record<string, string> = {};

  if (!displayName) fieldErrors.displayName = "请填写人物称呼或别名。";
  if (displayName.length > 40) fieldErrors.displayName = "人物称呼请控制在 40 个字以内。";
  if (influenceLevel !== null && (!Number.isInteger(influenceLevel) || influenceLevel < 1 || influenceLevel > 5)) {
    fieldErrors.influenceLevel = "影响程度请选择 1–5。";
  }
  if (observationKind && !observationContent) fieldErrors.observationContent = "选择信息类型后，请填写具体内容。";
  if (!observationKind && observationContent) fieldErrors.observationContent = "请为这条信息选择 Fact、Observation、Inference 或 User Feeling。";
  for (const key of ["roleTitle", "groupType", "organizationAlias", "relationshipType"]) {
    if (text(formData, key).length > 80) fieldErrors[key] = "请控制在 80 个字以内。";
  }
  for (const key of ["notes", "communicationSummary", "strategyContext", "strategy", "observationContent"]) {
    if (text(formData, key).length > 500) fieldErrors[key] = "请控制在 500 个字以内。";
  }

  if (Object.keys(fieldErrors).length > 0) return { status: "error", message: "有几项内容需要调整。", fieldErrors };

  try {
    const savedPersonId = await saveCurrentUserPerson({
      personId: optional(formData, "personId"),
      displayName,
      roleTitle: optional(formData, "roleTitle"),
      groupType: optional(formData, "groupType"),
      organizationAlias: optional(formData, "organizationAlias"),
      notes: optional(formData, "notes"),
      relationshipType: text(formData, "relationshipType") || "WORK_CONTACT",
      influenceLevel,
      communicationSummary: optional(formData, "communicationSummary"),
      strategyContext: optional(formData, "strategyContext"),
      strategy: optional(formData, "strategy"),
      observationKind,
      observationContent,
    });
    revalidatePath("/people");
    return { status: "success", message: "人物信息已保存，正在更新关系地图。", savedPersonId };
  } catch (error) {
    console.error("Failed to save person", error);
    return { status: "error", message: "暂时没有保存成功，请稍后再试。" };
  }
}

export async function reviewObservation(_state: PeopleFormState, formData: FormData): Promise<PeopleFormState> {
  const observationId = text(formData, "observationId");
  const decision = text(formData, "decision");
  if (!observationId || !["CONFIRM", "CORRECT", "REJECT"].includes(decision)) {
    return { status: "error", message: "无法识别这次操作。" };
  }
  const correctedContent = text(formData, "correctedContent");
  if (decision === "CORRECT" && !correctedContent) return { status: "error", message: "请先填写你认为更准确的说法。" };

  try {
    await reviewCurrentUserObservation({
      observationId,
      decision: decision as "CONFIRM" | "CORRECT" | "REJECT",
      correctedContent,
    });
    revalidatePath("/people");
    return { status: "success", message: decision === "REJECT" ? "这条推测已被拒绝。" : "你的判断已保存。" };
  } catch (error) {
    console.error("Failed to review observation", error);
    return { status: "error", message: "暂时没有保存成功，请稍后再试。" };
  }
}

export async function deletePerson(formData: FormData) {
  const personId = text(formData, "personId");
  if (!personId) return;
  await softDeleteCurrentUserPerson(personId);
  revalidatePath("/people");
}
