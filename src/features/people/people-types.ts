export type PersonObservationView = {
  id: string;
  kind: string;
  content: string;
  confidence: number | null;
  confirmationStatus: string;
  evidenceCount: number;
  counterEvidenceCount: number;
  sourceType: string;
};

export type PersonStrategyView = {
  id: string;
  context: string;
  strategy: string;
  status: string;
  evidenceCount: number;
};

export type PersonEventView = {
  id: string;
  title: string;
  date: string;
  roleInEvent: string | null;
  facts: string;
  outcome: string | null;
};

export type PersonView = {
  id: string;
  displayName: string;
  roleTitle: string | null;
  groupType: string | null;
  organizationAlias: string | null;
  notes: string | null;
  relationship: {
    id: string;
    relationshipType: string;
    closeness: number | null;
    influenceLevel: number | null;
    communicationSummary: string | null;
  } | null;
  observations: PersonObservationView[];
  strategies: PersonStrategyView[];
  events: PersonEventView[];
};

export type PeoplePageData = {
  currentUser: { displayName: string; currentRole: string | null };
  people: PersonView[];
};

export type PeopleFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
  savedPersonId?: string;
};
