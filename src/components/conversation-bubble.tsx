import { Sparkles } from "lucide-react";

export function ConversationBubble({ role, children }: { role: "companion" | "user"; children: React.ReactNode }) {
  if (role === "user") return <div className="ml-auto max-w-[76%] rounded-[22px_22px_6px_22px] bg-[#466a5b] px-5 py-3.5 text-sm leading-6 text-white">{children}</div>;
  return <div className="flex max-w-[88%] items-start gap-3"><span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#e5eee9] text-[#466a5b]"><Sparkles size={15}/></span><div className="rounded-[8px_22px_22px_22px] bg-white px-5 py-3.5 text-sm leading-6 text-[#3c4a44] shadow-sm">{children}</div></div>;
}
