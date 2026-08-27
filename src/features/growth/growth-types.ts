export type GrowthTimelineEvent = {
  id: string;
  date: string;
  month: string;
  title: string;
  facts: string;
  response: string | null;
  outcome: string | null;
  people: string[];
};

export type GrowthThemeView = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  source: string;
  confirmationStatus: string;
  originSummary: string | null;
  evidenceCount: number;
  timeline: GrowthTimelineEvent[];
};

export type GrowthReportView = {
  id: string;
  month: string;
  period: string;
  status: string;
  version: number;
  confirmedAt: string | null;
  summary: string;
  nextFocus: string | null;
  theme: {
    title: string;
    status: string;
    pastPattern: string | null;
    recentPattern: string | null;
    effectiveStrategy: string | null;
    nextExperiment: string | null;
  } | null;
  evidence: Array<{ text: string; date: string }>;
};

export type GrowthPageData = {
  userName: string;
  themes: GrowthThemeView[];
  reports: GrowthReportView[];
  interaction: {
    person: string | null;
    internalResponse: string | null;
    behavior: string | null;
    outcome: string | null;
    strategy: string | null;
  } | null;
};
