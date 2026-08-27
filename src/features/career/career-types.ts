export type CareerProfileView = {
  displayName: string;
  email: string | null;
  currentRole: string | null;
  industry: string | null;
  companyType: string | null;
  companyAlias: string | null;
  city: string | null;
  yearsExperience: number | null;
  teamName: string | null;
  teamSize: number | null;
  managerTitle: string | null;
  careerStage: string | null;
  profileCompleteness: number;
};

export type CareerGoalView = {
  id: string;
  horizon: string;
  title: string;
  description: string | null;
  status: string;
};

export type CareerThemeView = {
  id: string;
  title: string;
  description: string | null;
  status: string;
};

export type SelfModelView = {
  id: string;
  category: string;
  statement: string;
  evidenceCount: number;
  confirmationStatus: string;
};

export type CareerPageData = {
  profile: CareerProfileView;
  goals: CareerGoalView[];
  themes: CareerThemeView[];
  selfModel: SelfModelView[];
};

export type CareerFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};
