export type RoleplayDifficulty = "EASY" | "NORMAL" | "HARD";

export type RoleplayPersonView = {
  id: string;
  displayName: string;
  roleTitle: string | null;
  relationshipSummary: string | null;
  observations: Array<{
    id: string;
    kind: string;
    content: string;
    confirmationStatus: string;
  }>;
  strategies: Array<{ id: string; context: string; strategy: string; status: string }>;
};

export type RoleplayMessageView = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  sequenceNo: number;
  createdAt: string;
};

export type RoleplayReview = {
  good: string[];
  improve: string;
  alternative: string;
  nextFocus: string;
};

export type RoleplaySessionView = {
  id: string;
  personId: string | null;
  personName: string;
  roleTemplate: string;
  scenario: string;
  personaStyle: string | null;
  difficulty: string;
  userGoal: string;
  status: string;
  review: RoleplayReview | null;
  createdAt: string;
  messages: RoleplayMessageView[];
};

export type RoleplayPageData = {
  userName: string;
  people: RoleplayPersonView[];
  sessions: RoleplaySessionView[];
};

export type RoleplayActionResult = {
  status: "success" | "error";
  message: string;
  session?: RoleplaySessionView;
  userMessage?: RoleplayMessageView;
  assistantMessage?: RoleplayMessageView;
  review?: RoleplayReview;
};
