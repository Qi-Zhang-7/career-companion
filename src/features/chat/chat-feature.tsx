"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowUp, Bookmark, ChevronRight, History, MessagesSquare, Paperclip, Sparkles } from "lucide-react";
import { ConversationBubble } from "@/components/conversation-bubble";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const modes = [
  { id: "listen", label: "先听我说" },
  { id: "clarify", label: "帮我理一理" },
  { id: "advice", label: "给我建议" },
  { id: "practice", label: "陪我练" },
];
const responses: Record<string, string> = {
  listen: "听起来这件事已经让你绷了一阵子。我们先不急着解决——刚才发生的哪一个瞬间，最让你觉得累？",
  clarify: "我们先把它拆开一点：现在确定的事实是数据还没到，而周五的节点已经承诺了。你此刻最担心的是延期本身，还是张经理会觉得你没有在推进？",
  advice: "可以先用‘现状 + 已完成 + 依赖 + 下一步 + 时间点’回应。比如：分析逻辑已经完成，目前依赖接口数据；我今天 15:00 再确认，拿到后周五下班前给初版。",
  practice: "好，我来扮演张经理。我们先练最难的开场。——‘这个节点上周就定了，为什么现在才告诉我数据还没到？’",
};

export function ChatFeature() {
  const params = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") || "listen");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "companion"; text: string }>>([
    { role: "companion", text: "我在。今天想从哪件事开始？你不用先把它想清楚。" },
  ]);
  const send = (e: FormEvent) => { e.preventDefault(); if (!text.trim()) return; setMessages(v => [...v, { role: "user", text }, { role: "companion", text: responses[mode] }]); setText(""); };
  return <div className="page-content fade-in">
    <div className="grid min-h-[calc(100vh-72px)] grid-cols-[260px_1fr] gap-5 max-[820px]:grid-cols-1">
      <aside className="max-[820px]:hidden"><div className="eyebrow mb-3">陪伴记录</div><Button className="mb-5 w-full" variant="secondary"><MessagesSquare size={16}/>开始新对话</Button>{["项目经理又催进度了", "我是不是该换个方向", "客户临时改需求", "和后端确认接口"].map((t,i)=><button key={t} className={cn("mb-1 w-full rounded-xl px-3 py-3 text-left text-sm cursor-pointer border-0", i===0 ? "bg-white text-[#385348] shadow-sm" : "bg-transparent text-[#758179] hover:bg-white/55")}><span className="block truncate">{t}</span><small className="mt-1 block text-[#9aa39e]">{i===0 ? "今天" : `${i+1} 天前`}</small></button>)}</aside>
      <Card className="flex min-h-[700px] flex-col overflow-hidden">
        <header className="border-b border-[#e7e3da] px-6 py-5"><div className="flex items-center justify-between gap-4"><div><h1 className="m-0 font-serif text-xl font-medium">项目经理又催进度了</h1><p className="mb-0 mt-1 text-xs text-[#89938d]">这是一个安全的私人空间 · Mock 对话</p></div><Button variant="ghost" size="sm"><History size={16}/>历史</Button></div><div className="mt-5 flex flex-wrap gap-2">{modes.map(m=><button key={m.id} onClick={()=>setMode(m.id)} className={cn("cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition", mode===m.id ? "border-[#466a5b] bg-[#466a5b] text-white" : "border-[#dedbd3] bg-white text-[#6f7c75] hover:border-[#9fb0a7]")}>{m.label}</button>)}</div></header>
        <div className="flex-1 space-y-5 overflow-auto bg-[#f7f5f0]/70 p-7">
          <div className="mx-auto mb-7 max-w-md rounded-full bg-[#eeeae2] px-4 py-2 text-center text-[11px] text-[#7c8781]">关联记忆 · 张经理偏好结论先行和明确节点</div>
          {messages.map((m,i)=><ConversationBubble role={m.role} key={i}>{m.text}</ConversationBubble>)}
          {messages.length > 1 && <div className="ml-11 max-w-lg rounded-2xl border border-[#dfddd5] bg-white/60 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#466a5b]"><Bookmark size={14}/>可能值得记住</div><p className="m-0 text-sm leading-6 text-[#65726b]">当进度被催时，你更担心别人认为你“没有推进”，而不只是延期本身。</p><div className="mt-3 flex gap-2"><Button size="sm" variant="secondary">保存</Button><Button size="sm" variant="ghost">先不保存</Button></div></div>}
        </div>
        <footer className="border-t border-[#e7e3da] bg-white/80 p-5"><form onSubmit={send} className="rounded-2xl border border-[#dcd9d0] bg-white p-3 shadow-sm focus-within:border-[#91a79b]"><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={mode === "listen" ? "慢慢说，我在听…" : "说说现在发生了什么…"} className="min-h-16 w-full resize-none border-0 bg-transparent px-2 py-1 text-sm leading-6 outline-none"/><div className="flex items-center justify-between"><button type="button" className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#8a958f] hover:bg-[#f0eee9]"><Paperclip size={17}/></button><button className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-[#466a5b] text-white"><ArrowUp size={17}/></button></div></form><div className="mt-3 flex justify-between gap-3 text-xs text-[#8a958f]"><span><Sparkles size={12} className="mr-1 inline"/>当前：{modes.find(m=>m.id===mode)?.label}</span><Link href="/roleplay" className="font-semibold text-[#466a5b] no-underline">直接进入模拟 <ChevronRight size={13} className="inline"/></Link></div></footer>
      </Card>
    </div>
  </div>;
}
