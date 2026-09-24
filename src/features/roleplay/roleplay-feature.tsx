"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock3, RotateCcw, Send, Sparkles, Target } from "lucide-react";
import { ConversationBubble } from "@/components/conversation-bubble";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createRoleplay, finishRoleplay, sendRoleplayMessage } from "./roleplay-actions";
import type { RoleplayDifficulty, RoleplayPageData, RoleplaySessionView } from "./roleplay-types";

const scenarios = ["项目经理催进度，但数据还没到", "政府客户临时增加需求", "和后端确认接口延期", "向领导争取项目资源"];
const difficultyLabels: Record<RoleplayDifficulty, string> = { EASY: "温和", NORMAL: "真实", HARD: "有压力" };
const kindLabels: Record<string, string> = { FACT: "事实", OBSERVATION: "观察", INFERENCE: "推测", USER_FEELING: "我的感受" };

export function RoleplayFeature({ data }: { data: RoleplayPageData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSession = data.sessions.find((item) => item.id === searchParams.get("sessionId")) ?? null;
  const [current, setCurrent] = useState<RoleplaySessionView | null>(initialSession);
  const [step, setStep] = useState<"setup" | "brief" | "chat" | "review">(initialSession?.review ? "review" : initialSession ? "chat" : "setup");
  const [personId, setPersonId] = useState(initialSession?.personId ?? data.people[0]?.id ?? "");
  const [scenario, setScenario] = useState(initialSession?.scenario ?? scenarios[0]);
  const [goal, setGoal] = useState(initialSession?.userGoal ?? "争取合理时间，同时让对方知道我在主动推进");
  const [personaStyle, setPersonaStyle] = useState(initialSession?.personaStyle ?? "结果导向，会追问节点与风险");
  const [difficulty, setDifficulty] = useState<RoleplayDifficulty>((initialSession?.difficulty as RoleplayDifficulty) ?? "NORMAL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const selectedPerson = data.people.find((item) => item.id === personId);
  const facts = useMemo(() => selectedPerson?.observations.filter((item) => item.kind === "FACT" || item.kind === "OBSERVATION").slice(0, 2) ?? [], [selectedPerson]);
  const concern = selectedPerson?.relationshipSummary ?? selectedPerson?.strategies[0]?.strategy ?? "对方可能更关注结果是否可控，以及何时能收到下一次同步。";

  function openSession(session: RoleplaySessionView) {
    setCurrent(session); setPersonId(session.personId ?? ""); setScenario(session.scenario); setGoal(session.userGoal);
    setPersonaStyle(session.personaStyle ?? "结果导向"); setDifficulty((session.difficulty as RoleplayDifficulty) ?? "NORMAL");
    setStep(session.review ? "review" : "chat"); setError("");
    router.replace(`/roleplay?sessionId=${session.id}`, { scroll: false });
  }

  function reset() {
    setCurrent(null); setStep("setup"); setMessage(""); setError("");
    router.replace("/roleplay", { scroll: false });
  }

  function createSession() {
    const formData = new FormData();
    formData.set("personId", personId); formData.set("scenario", scenario); formData.set("userGoal", goal);
    formData.set("personaStyle", personaStyle); formData.set("difficulty", difficulty);
    startTransition(async () => {
      const result = await createRoleplay(formData);
      if (result.status === "error" || !result.session) return setError(result.message);
      openSession(result.session);
    });
  }

  function send() {
    if (!current || !message.trim()) return;
    const content = message.trim();
    const formData = new FormData(); formData.set("sessionId", current.id); formData.set("content", content);
    setMessage(""); setError("");
    startTransition(async () => {
      const result = await sendRoleplayMessage(formData);
      if (result.status === "error" || !result.userMessage || !result.assistantMessage) { setMessage(content); return setError(result.message); }
      setCurrent((value) => value ? { ...value, messages: [...value.messages, result.userMessage!, result.assistantMessage!] } : value);
    });
  }

  function finish() {
    if (!current) return;
    const formData = new FormData(); formData.set("sessionId", current.id);
    startTransition(async () => {
      const result = await finishRoleplay(formData);
      if (result.status === "error" || !result.review) return setError(result.message);
      setCurrent((value) => value ? { ...value, status: "ARCHIVED", review: result.review! } : value);
      setStep("review");
    });
  }

  return <div className="page-content fade-in">
    <PageHeader eyebrow="Practice Lab" title="先在这里，安全地练一遍" subtitle="选择一个真实人物和场景。练习记录会保存，方便之后回看变化。" />
    {step === "setup" && <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5 max-[950px]:grid-cols-1">
      <Card className="p-7">
        <Field title="1 · 你要和谁沟通？">
          {data.people.length ? <div className="grid grid-cols-3 gap-3 max-[700px]:grid-cols-2">{data.people.map((person) => <button key={person.id} onClick={() => setPersonId(person.id)} className={cn("cursor-pointer rounded-2xl border p-4 text-left transition", personId === person.id ? "border-[#466a5b] bg-[#e9f0ec]" : "border-[#e3dfd6] bg-white hover:border-[#a8b7af]")}><div className="mb-3 grid size-9 place-items-center rounded-full bg-[#6f8c7f] text-sm font-bold text-white">{person.displayName.slice(0, 1)}</div><strong className="block text-sm">{person.displayName}</strong><small className="text-[#7f8a84]">{person.roleTitle ?? "职场关系"}</small></button>)}</div> : <p className="rounded-xl bg-[#faf8f3] p-4 text-sm text-[#6d7872]">还没有人物，请先到“职场关系”新增一个真实沟通对象。</p>}
        </Field>
        <Field title="2 · 发生了什么？"><div className="space-y-2">{scenarios.map((item) => <button key={item} onClick={() => setScenario(item)} className={cn("flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-sm", scenario === item ? "border-[#b76e54] bg-[#faf0eb]" : "border-[#e6e2da] bg-white")}><span>{item}</span>{scenario === item && <Check size={16} className="text-[#b76e54]" />}</button>)}</div><textarea value={scenario} onChange={(event) => setScenario(event.target.value)} className="mt-3 min-h-20 w-full rounded-xl border border-[#dedad1] bg-white p-3 text-sm outline-none focus:border-[#8da297]" placeholder="也可以写下自己的真实场景…" /></Field>
        <Field title="3 · 这次你想达成什么？"><textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="min-h-20 w-full rounded-xl border border-[#dedad1] bg-white p-3 text-sm outline-none focus:border-[#8da297]" /></Field>
        <Field title="4 · 对方在模拟中的风格"><input value={personaStyle} onChange={(event) => setPersonaStyle(event.target.value)} className="h-11 w-full rounded-xl border border-[#dedad1] bg-white px-4 text-sm outline-none focus:border-[#8da297]" /></Field>
        <Field title="5 · 难度"><div className="flex flex-wrap gap-2">{(Object.keys(difficultyLabels) as RoleplayDifficulty[]).map((item) => <button key={item} onClick={() => setDifficulty(item)} className={cn("cursor-pointer rounded-full border px-5 py-2 text-sm", difficulty === item ? "border-[#466a5b] bg-[#466a5b] text-white" : "border-[#dedad1] bg-white")}>{difficultyLabels[item]}</button>)}</div></Field>
      </Card>
      <div className="space-y-5"><Card className="p-6"><Badge tone="warm">来自职场关系</Badge><h2 className="mt-4 font-serif text-2xl font-medium">{selectedPerson?.displayName ?? "等待选择人物"}</h2><p className="text-sm leading-6 text-[#66736c]">{selectedPerson?.relationshipSummary ?? "选择人物后，会带入你已经确认的人物信息；推测仍会明确标注为推测。"}</p>{selectedPerson?.observations.slice(0, 4).map((item) => <div key={item.id} className="mt-3 rounded-xl bg-[#f7f5f0] p-3 text-sm"><span className="mr-2 text-xs font-bold text-[#7b887f]">{kindLabels[item.kind] ?? item.kind}</span>{item.content}</div>)}<Button className="mt-5 w-full" disabled={!personId} onClick={() => setStep("brief")}>查看沟通准备 <ArrowRight size={17} /></Button></Card>
      {data.sessions.length > 0 && <Card className="p-5"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Clock3 size={16} />最近练习</div><div className="space-y-2">{data.sessions.slice(0, 5).map((session) => <button key={session.id} onClick={() => openSession(session)} className="w-full cursor-pointer rounded-xl border border-[#e6e2da] bg-white p-3 text-left"><strong className="block truncate text-sm">{session.personName} · {session.scenario}</strong><small className="text-[#849087]">{session.createdAt} · {session.review ? "已复盘" : "可继续"}</small></button>)}</div></Card>}</div>
    </div>}

    {step === "brief" && <Card className="mx-auto max-w-4xl overflow-hidden"><div className="border-b border-[#e6e2da] bg-[#faf8f3] p-7"><button onClick={() => setStep("setup")} className="mb-5 flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm text-[#718078]"><ArrowLeft size={15} />返回设置</button><Badge>沟通准备</Badge><h2 className="mt-3 font-serif text-3xl font-medium">{scenario}</h2></div><div className="grid grid-cols-2 gap-x-8 gap-y-6 p-8 max-[700px]:grid-cols-1"><Insight title="我的目标" text={goal} /><Insight title="对方可能关注什么" text={concern} /><Insight title="当前事实" text={facts.length ? facts.map((item) => item.content).join("；") : "目前没有已确认事实。进入模拟前，可以先补充你确定知道的信息。"} /><Insight title="沟通风险" text="只描述困难，容易让对方觉得事情失控；把推测当事实，也可能影响双方信任。" /><div className="col-span-2 rounded-2xl bg-[#e9f0ec] p-5 max-[700px]:col-span-1"><div className="mb-2 text-xs font-bold text-[#466a5b]">推荐表达结构</div><div className="font-serif text-lg">事实 → 依赖 → 下一步 → 时间节点 → 风险预案</div><p className="mb-0 mt-3 text-sm leading-6 text-[#65746c]">这里提供的是结构，不替你虚构事实。模拟中可以按自己的真实情况表达。</p></div></div><div className="flex justify-end border-t border-[#e6e2da] p-6"><Button disabled={pending} onClick={createSession}><Sparkles size={16} />{pending ? "正在创建…" : "进入 Role Play"}</Button></div></Card>}

    {step === "chat" && current && <Card className="mx-auto flex h-[min(760px,calc(100vh-150px))] min-h-[560px] max-w-4xl flex-col overflow-hidden"><header className="flex items-center justify-between border-b border-[#e4e0d8] p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#6f8c7f] font-bold text-white">{current.personName.slice(0, 1)}</span><div><h2 className="m-0 text-base">{current.personName}</h2><small className="text-[#7d8982]">模拟中 · {difficultyLabels[current.difficulty as RoleplayDifficulty] ?? current.difficulty}</small></div></div><Badge tone="warm">规则模拟</Badge></header><div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#f7f5f0] p-7">{current.messages.map((item) => <ConversationBubble key={item.id} role={item.role === "USER" ? "user" : "companion"}>{item.content}</ConversationBubble>)}{pending && <div className="text-center text-xs text-[#7c8781]">对方正在回应…</div>}</div><footer className="border-t border-[#e4e0d8] bg-white p-5"><div className="flex gap-3"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} className="h-11 flex-1 rounded-full border border-[#dcd8cf] px-5 text-sm outline-none focus:border-[#8da297]" placeholder={`真实地回应${current.personName}…`} /><Button size="md" disabled={pending || !message.trim()} onClick={send}><Send size={16} /></Button></div>{error && <p className="mt-2 text-sm text-[#a24f3b]">{error}</p>}<div className="mt-4 flex justify-between"><Button variant="ghost" size="sm" onClick={reset}><RotateCcw size={15} />退出并重新设置</Button><Button variant="warm" size="sm" disabled={pending} onClick={finish}>结束模拟并复盘 <ArrowRight size={15} /></Button></div></footer></Card>}

    {step === "review" && current?.review && <Card className="mx-auto max-w-4xl overflow-hidden"><div className="border-b border-[#e6e2da] bg-[#e9f0ec] p-7"><Badge>本次复盘已保存</Badge><h2 className="mt-3 font-serif text-3xl font-medium">不是打分，而是看见具体变化</h2><p className="mb-0 text-sm text-[#647169]">{current.personName} · {current.scenario}</p></div><div className="grid grid-cols-2 gap-5 p-7 max-[720px]:grid-cols-1"><Review title="做得好的具体地方">{current.review.good.map((item) => <p key={item} className="m-0 mb-2 text-sm leading-6">• {item}</p>)}</Review><Review title="可以改进的地方"><p>{current.review.improve}</p></Review><Review title="替代表达"><p>{current.review.alternative}</p></Review><Review title="下一次练习重点"><p>{current.review.nextFocus}</p></Review></div><div className="flex flex-wrap justify-between gap-3 border-t border-[#e6e2da] p-6"><Button variant="ghost" onClick={reset}>再练一个场景</Button><Button onClick={() => router.push(`/reflection?source=roleplay&sessionId=${current.id}`)}>进入完整复盘 <ArrowRight size={15} /></Button></div></Card>}
    {error && step !== "chat" && <p className="mx-auto mt-4 max-w-4xl rounded-xl bg-[#fff0eb] p-3 text-sm text-[#a24f3b]">{error}</p>}
  </div>;
}

function Field({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mb-8"><h2 className="mb-4 text-sm font-bold text-[#526159]">{title}</h2>{children}</section>; }
function Insight({ title, text }: { title: string; text: string }) { return <div><div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#708078]"><Target size={14} />{title}</div><p className="m-0 text-sm leading-6">{text}</p></div>; }
function Review({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-[#e3dfd6] bg-[#faf9f6] p-5"><h3 className="mt-0 text-sm text-[#496758]">{title}</h3><div className="text-sm leading-6 text-[#505b55]">{children}</div></section>; }
