export type ChatMode = "LISTENING" | "COACHING" | "ADVICE" | "ROLEPLAY";

export type ChatMessageView = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  mode: string | null;
  sequenceNo: number;
  createdAt: string;
};

export type ConversationView = {
  id: string;
  mode: string;
  title: string | null;
  status: string;
  summary: string | null;
  startedAt: string;
  endedAt: string | null;
  messages: ChatMessageView[];
};

export type ChatPageData = {
  chatHistoryEnabled: boolean;
  userName: string;
  conversations: ConversationView[];
};

export type ChatActionResult = {
  status: "success" | "error";
  message: string;
  conversationId?: string;
  title?: string;
  userMessage?: ChatMessageView;
  assistantMessage?: ChatMessageView;
  summary?: string;
  deletedCount?: number;
  persisted?: boolean;
};
