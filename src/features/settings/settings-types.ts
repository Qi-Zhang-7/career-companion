export type MemoryEvidenceView = {
  id: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  messageExcerpt: string | null;
  evidenceWeight: number | null;
  createdAt: string;
};

export type MemoryLinkView = {
  id: string;
  entityType: string;
  entityId: string;
  relationType: string;
  entityLabel: string;
};

export type MemoryView = {
  id: string;
  type: string;
  canonicalText: string;
  certainty: string;
  confidence: number | null;
  importance: number;
  sensitivity: string;
  confirmationStatus: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  evidence: MemoryEvidenceView[];
  links: MemoryLinkView[];
};

export type SettingsPageData = {
  user: { displayName: string; memoryEnabled: boolean };
  memories: MemoryView[];
};

export type MemoryFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
  savedMemoryId?: string;
};
