export type ReflectionRecordView = {
  id: string;
  roleplaySessionId: string | null;
  goalSelf: string;
  goalOther: string;
  whatHappened: string;
  userFeeling: string;
  workedWell: string;
  improvements: string;
  nextExperiment: string;
  createdAt: string;
  updatedAt: string;
};

export type ReflectionSourceView = {
  id: string;
  personName: string;
  scenario: string;
  userGoal: string;
  difficulty: string;
  status: string;
  createdAt: string;
  possibleOtherGoal: string;
  messages: Array<{
    id: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    content: string;
    sequenceNo: number;
  }>;
  draftReview: {
    good: string[];
    improve: string;
    alternative: string;
    nextFocus: string;
  } | null;
  reflection: ReflectionRecordView | null;
};

export type ReflectionPageData = {
  selected: ReflectionSourceView | null;
  recentRoleplays: Array<{
    id: string;
    personName: string;
    scenario: string;
    createdAt: string;
    hasReflection: boolean;
  }>;
};

export type ReflectionFormState = {
  status: "idle" | "success" | "error";
  message: string;
  reflection?: ReflectionRecordView;
  fieldErrors?: Record<string, string>;
};
