"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { ArrowUp, Bookmark, CheckCircle2, ChevronRight, MessagesSquare, PanelLeftClose, PanelLeftOpen, Paperclip, Sparkles } from "lucide-react";
import { ConversationBubble } from "@/components/conversation-bubble";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { finishConversation, sendChatMessage } from "@/features/chat/chat-actions";
import type { ChatMode, ChatPageData, ConversationView } from "@/features/chat/chat-types";
import { cn } from "@/lib/utils";

const modes: Array<{ id: ChatMode; query: string; label: string; placeholder: string }> = [
  { id: "LISTENING", query: "listen", label: "先听我说", placeholder: "慢慢说，我在听…" },
  { id: "COACHING", query: "clarify", label: "帮我理一理", placeholder: "说说现在发生了什么…" },
  { id: "ADVICE", query: "advice", label: "给我建议", placeholder: "把目标和限制告诉我…" },
  { id: "ROLEPLAY", query: "practice", label: "陪我练", placeholder: "想练习怎样的沟通？" },
];

function modeFromQuery(value: string | null): ChatMode {
  return modes.find((mode) => mode.query === value)?.id ?? "LISTENING";
}

export function ChatFeature({ data }: { data: ChatPageData }) {
  const params = useSearchParams();
  const router = useRouter();
  const [conversations, setConversations] = useState(data.conversations);
  const [selectedId, setSelectedId] = useState<string | null>(data.conversations[0]?.id ?? null);
  const [draftMode, setDraftMode] = useState<ChatMode>(modeFromQuery(params.get("mode")));
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [pending, startTransition] = useTransition();
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const mode = (selected?.mode as ChatMode | undefined) ?? draftMode;

  useEffect(() => { setConversations(data.conversations); }, [data.conversations]);

  const selectMode = (nextMode: ChatMode) => {
    setDraftMode(nextMode);
    if (selected) setConversations((items) => items.map((item) => item.id === selected.id ? { ...item, mode: nextMode } : item));
  };

  const startNew = () => {
    setSelectedId(null);
    setDraftMode(modeFromQuery(params.get("mode")));
    setText("");
    setNotice("");
  };

  const selectConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    setNotice("");
  };

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = text.trim();
    if (!content || pending) return;
    const formData = new FormData();
    formData.set("content", content);
    formData.set("mode", mode);
    if (selectedId) formData.set("conversationId", selectedId);
    setNotice("");
    startTransition(async () => {
      const result = await sendChatMessage(formData);
      if (result.status === "error" || !result.conversationId || !result.userMessage || !result.assistantMessage) {
        setNotice(result.message);
        return;
      }
      setText("");
      setSelectedId(result.conversationId);
      setConversations((items) => {
        const existing = items.find((item) => item.id === result.conversationId);
        if (existing) return items.map((item) => item.id === result.conversationId ? { ...item, mode, messages: [...item.messages, result.userMessage!, result.assistantMessage!] } : item);
        const created: ConversationView = {
          id: result.conversationId!, mode, title: result.title ?? content.slice(0, 28), status: "ACTIVE", summary: null,
          startedAt: "刚刚", endedAt: null,
          messages: [
            { id: `greeting-${result.conversationId}`, role: "ASSISTANT", content: "我在。你不用先把事情想清楚，慢慢说就好。", mode, sequenceNo: 1, createdAt: "刚刚" },
            result.userMessage!, result.assistantMessage!,
          ],
        };
        return [created, ...items];
      });
      router.refresh();
    });
  };

  const finish = () => {
    if (!selectedId || pending) return;
    const formData = new FormData();
    formData.set("conversationId", selectedId);
    startTransition(async () => {
      const result = await finishConversation(formData);
      setNotice(result.message);
      if (result.status === "success") {
        setConversations((items) => items.map((item) => item.id === selectedId ? { ...item, status: "ARCHIVED", summary: result.summary ?? null, endedAt: "刚刚" } : item));
        router.refresh();
      }
    });
  };

  const messages = selected?.messages ?? [{ id: "draft-greeting", role: "ASSISTANT" as const, content: `我在，${data.userName}。今天想从哪件事开始？你不用先把它想清楚。`, mode, sequenceNo: 1, createdAt: "刚刚" }];
  const hasUserMessage = messages.some((message) => message.role === "USER");

  return <div className="page-content fade-in"><div className={cn("grid h-[calc(100dvh-104px)] min-h-[620px] gap-5 transition-[grid-template-columns] duration-200 max-[820px]:grid-cols-1", historyCollapsed ? "grid-cols-[52px_1fr]" : "grid-cols-[260px_1fr]")}>
    <aside className={cn("min-w-0 overflow-y-auto pr-1 max-[820px]:hidden", historyCollapsed && "overflow-hidden")}>
      <div className={cn("mb-3 flex items-center", historyCollapsed ? "justify-center" : "justify-between")}>
        {!historyCollapsed && <div className="eyebrow">陪伴记录</div>}
        <button type="button" onClick={() => setHistoryCollapsed((value) => !value)} aria-label={historyCollapsed ? "展开会话历史" : "折叠会话历史"} title={historyCollapsed ? "展开会话历史" : "折叠会话历史"} className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/75 text-[#718078] shadow-sm hover:bg-white">
          {historyCollapsed ? <PanelLeftOpen size={17}/> : <PanelLeftClose size={17}/>}
        </button>
      </div>
      {!historyCollapsed && <><Button className="mb-5 w-full" variant="secondary" onClick={startNew}><MessagesSquare size={16}/>开始新对话</Button>{conversations.length > 0 ? conversations.map((conversation) => <button key={conversation.id} onClick={() => selectConversation(conversation.id)} className={cn("mb-1 w-full cursor-pointer rounded-xl border-0 px-3 py-3 text-left text-sm", selectedId === conversation.id ? "bg-white text-[#385348] shadow-sm" : "bg-transparent text-[#758179] hover:bg-white/55")}><span className="block truncate">{conversation.title ?? "未命名对话"}</span><small className="mt-1 flex justify-between text-[#9aa39e]"><span>{conversation.startedAt}</span><span>{conversation.status === "ARCHIVED" ? "已结束" : "进行中"}</span></small></button>) : <p className="text-xs leading-5 text-[#89938d]">还没有历史对话。第一条消息发送后会自动创建。</p>}</>}
    </aside>

    <Card className="flex min-h-0 flex-col overflow-hidden"><header className="shrink-0 border-b border-[#e7e3da] px-6 py-5"><div className="flex items-center justify-between gap-4"><div><h1 className="m-0 font-serif text-xl font-medium">{selected?.title ?? "新的陪伴对话"}</h1><p className="mb-0 mt-1 text-xs text-[#89938d]">私人空间 · 消息实时保存 · AI 回复暂为 Mock</p></div><Button variant="ghost" size="sm" onClick={finish} disabled={!selectedId || selected?.status === "ARCHIVED" || pending}><CheckCircle2 size={15}/>{selected?.status === "ARCHIVED" ? "已结束" : "结束并总结"}</Button></div><div className="mt-5 flex flex-wrap gap-2">{modes.map((item) => <button key={item.id} onClick={() => selectMode(item.id)} className={cn("cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition", mode === item.id ? "border-[#466a5b] bg-[#466a5b] text-white" : "border-[#dedbd3] bg-white text-[#6f7c75] hover:border-[#9fb0a7]")}>{item.label}</button>)}</div></header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-scroll bg-[#f7f5f0]/70 p-7">{selected?.summary && <div className="rounded-2xl border border-[#dfe4df] bg-[#eef2ed] p-4"><div className="mb-2 text-xs font-semibold text-[#466a5b]">会话概要 · 规则生成</div><p className="m-0 text-sm leading-6 text-[#5f6f67]">{selected.summary}</p></div>}{messages.map((message) => message.role !== "SYSTEM" && <ConversationBubble role={message.role === "USER" ? "user" : "companion"} key={message.id}>{message.content}</ConversationBubble>)}
        {hasUserMessage && <div className="ml-11 max-w-lg rounded-2xl border border-[#dfddd5] bg-white/60 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#466a5b]"><Bookmark size={14}/>长期记忆边界</div><p className="m-0 text-sm leading-6 text-[#65726b]">本轮消息和会话概要已经保存，但不会自动变成长期记忆。后续接入提取器后，也必须先形成候选并由你确认。</p><Button className="mt-3" size="sm" variant="ghost" asChild><Link href="/settings">查看记忆与隐私</Link></Button></div>}
        {notice && <div className={`mx-auto max-w-lg rounded-xl px-4 py-3 text-center text-xs ${notice.includes("失败") || notice.includes("没有") ? "bg-[#f8e9e3] text-[#9a5742]" : "bg-[#e5eee9] text-[#466a5b]"}`}>{notice}</div>}
      </div>

      <footer className="shrink-0 border-t border-[#e7e3da] bg-white/80 p-5"><form onSubmit={send} className="rounded-2xl border border-[#dcd9d0] bg-white p-3 shadow-sm focus-within:border-[#91a79b]"><textarea value={text} onChange={(event) => setText(event.target.value)} disabled={selected?.status === "ARCHIVED" || pending} placeholder={selected?.status === "ARCHIVED" ? "这段对话已经结束，可以开始一段新对话。" : modes.find((item) => item.id === mode)?.placeholder} className="min-h-16 w-full resize-none border-0 bg-transparent px-2 py-1 text-sm leading-6 outline-none disabled:opacity-60"/><div className="flex items-center justify-between"><button type="button" className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#8a958f] hover:bg-[#f0eee9]" title="附件功能后续开放"><Paperclip size={17}/></button><button disabled={!text.trim() || pending || selected?.status === "ARCHIVED"} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-[#466a5b] text-white disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp size={17}/></button></div></form><div className="mt-3 flex justify-between gap-3 text-xs text-[#8a958f]"><span><Sparkles size={12} className="mr-1 inline"/>当前：{modes.find((item) => item.id === mode)?.label}</span><Link href="/roleplay" className="font-semibold text-[#466a5b] no-underline">进入完整模拟 <ChevronRight size={13} className="inline"/></Link></div></footer>
    </Card>
  </div></div>;
}
