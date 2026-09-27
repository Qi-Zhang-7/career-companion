"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, CheckCircle2, History, Lightbulb, Save, Sparkles } from "lucide-react";
import { ConversationBubble } from "@/components/conversation-bubble";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveRoleplayReflection } from "./reflection-actions";
import type { ReflectionFormState, ReflectionPageData, ReflectionSourceView } from "./reflection-types";

const initialState: ReflectionFormState = { status: "idle", message: "" };

export function ReflectionFeature({ data }: { data: ReflectionPageData }) {
  return <div className="page-content fade-in">
    <PageHeader eyebrow="Reflection" title="把一次练习，变成下一次的底气" subtitle="复盘不是给自己打分。区分模拟、感受与事实，只留下一个下次可以尝试的动作。" />
    {data.selected ? <ReflectionEditor key={data.selected.id} source={data.selected} /> : <ReflectionHome data={data} />}
  </div>;
}

function ReflectionHome({ data }: { data: ReflectionPageData }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5 max-[900px]:grid-cols-1">
    <Card className="p-7">
      <div className="mb-6 flex items-center gap-3">
        <History className="text-[#547263]" size={20} />
        <div><h2 className="m-0 font-serif text-2xl font-medium">选择一次已结束的模拟</h2><p className="mb-0 mt-1 text-sm text-[#718078]">正式复盘会与这次练习一对一保存。</p></div>
      </div>
      {data.recentRoleplays.length ? <div className="space-y-3">{data.recentRoleplays.map((item) => <Link key={item.id} href={`/reflection?source=roleplay&sessionId=${item.id}`} className="flex items-center justify-between gap-5 rounded-2xl border border-[#e1ddd5] bg-white p-4 text-inherit no-underline transition hover:border-[#9eaea5] hover:bg-[#fafbf8]"><div className="min-w-0"><strong className="block truncate text-sm">{item.personName} · {item.scenario}</strong><small className="mt-1 block text-[#89928d]">{item.createdAt}</small></div><Badge tone={item.hasReflection ? "sage" : "warm"}>{item.hasReflection ? "继续编辑" : "开始复盘"}</Badge></Link>)}</div> : <div className="rounded-2xl bg-[#f7f5f0] p-6 text-sm leading-6 text-[#6b7770]">还没有已经结束的模拟。先完成一次 Role Play，再回来复盘。</div>}
      <Button asChild variant="outline" className="mt-6"><Link href="/roleplay">去模拟沟通</Link></Button>
    </Card>
    <Card className="h-fit p-6"><div className="mb-3 flex items-center gap-2 font-semibold"><Lightbulb size={17} className="text-[#b76e54]" />这一轮的边界</div><p className="text-sm leading-6 text-[#718078]">模拟表现不是现实成长证据。这里先保存练习后的理解和下次实验；只有真实工作中尝试并带回结果后，才进入 Growth 的变化证据。</p></Card>
  </div>;
}

function ReflectionEditor({ source }: { source: ReflectionSourceView }) {
  const [state, action, pending] = useActionState(saveRoleplayReflection, initialState);
  const saved = state.reflection ?? source.reflection;
  const draft = source.draftReview;
  const defaults = {
    whatHappened: saved?.whatHappened ?? `这是一次模拟练习。场景是：${source.scenario}`,
    goalSelf: saved?.goalSelf ?? source.userGoal,
    goalOther: saved?.goalOther ?? source.possibleOtherGoal,
    userFeeling: saved?.userFeeling ?? "",
    workedWell: saved?.workedWell ?? draft?.good.join("\n") ?? "",
    improvements: saved?.improvements ?? draft?.improve ?? "",
    nextExperiment: saved?.nextExperiment ?? draft?.nextFocus ?? "",
  };

  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Button asChild variant="ghost" size="sm"><Link href="/reflection"><ArrowLeft size={15} />返回复盘列表</Link></Button><div className="flex items-center gap-2"><Badge tone="warm">来自模拟，不是真实事件</Badge>{saved && <Badge tone="sage">已保存 · {saved.updatedAt}</Badge>}</div></div>
    <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-5 max-[980px]:grid-cols-1">
      <Card className="p-7">
        <div className="mb-6"><p className="m-0 text-xs font-bold uppercase tracking-widest text-[#8b7569]">{source.personName} · {source.createdAt}</p><h2 className="mb-2 mt-2 font-serif text-2xl font-medium">{source.scenario}</h2><p className="m-0 text-sm text-[#718078]">规则草稿只是起点，以你的确认和修改为准。</p></div>
        <form action={action} className="space-y-5">
          <input type="hidden" name="roleplaySessionId" value={source.id} />
          <Field name="whatHappened" label="1 · 模拟中发生了什么？" hint="只记录这次练习，不把它写成现实中已经发生的结果。" defaultValue={defaults.whatHappened} error={state.fieldErrors?.whatHappened} required />
          <Field name="goalSelf" label="2 · 我的沟通目标" defaultValue={defaults.goalSelf} error={state.fieldErrors?.goalSelf} />
          <Field name="goalOther" label="3 · 对方可能关注什么？" hint="这是等待你确认的推测，不是对方人格事实。" defaultValue={defaults.goalOther} error={state.fieldErrors?.goalOther} tone="inference" />
          <Field name="userFeeling" label="4 · 我当时的感受、担心，或者最难说的是什么？" hint="这是你的主观感受，会与客观事实分开保存。" defaultValue={defaults.userFeeling} error={state.fieldErrors?.userFeeling} tone="feeling" />
          <Field name="workedWell" label="5 · 哪个具体回应做得比较好？" hint="尽量引用一句表达或一个具体动作。" defaultValue={defaults.workedWell} error={state.fieldErrors?.workedWell} />
          <Field name="improvements" label="6 · 哪个地方可以改进？" defaultValue={defaults.improvements} error={state.fieldErrors?.improvements} />
          <Field name="nextExperiment" label="7 · 下一次只尝试什么？" hint="只留一个低风险、可观察的动作，不堆叠很多建议。" defaultValue={defaults.nextExperiment} error={state.fieldErrors?.nextExperiment} required />
          {state.message && <div className={`rounded-xl p-3 text-sm ${state.status === "success" ? "bg-[#eaf2ed] text-[#426454]" : "bg-[#fff0eb] text-[#a24f3b]"}`}>{state.status === "success" && <CheckCircle2 className="mr-2 inline" size={16} />}{state.message}</div>}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2"><p className="m-0 max-w-md text-xs leading-5 text-[#89928d]">保存后可以继续修改同一份复盘。目前不会自动生成长期记忆，也不会直接算作 Growth 证据。</p><Button size="lg" disabled={pending}><Save size={16} />{pending ? "正在保存…" : saved ? "保存修改" : "保存这次复盘"}</Button></div>
        </form>
      </Card>
      <aside className="space-y-5">
        {draft && <Card className="p-6"><div className="mb-3 flex items-center gap-2 font-semibold"><Sparkles size={17} className="text-[#b76e54]" />模拟结束时的规则草稿</div><Draft label="做得好的地方" value={draft.good.join("；")} /><Draft label="可改进" value={draft.improve} /><Draft label="替代表达" value={draft.alternative} /><Draft label="下次重点" value={draft.nextFocus} /></Card>}
        <Card className="overflow-hidden"><div className="border-b border-[#e5e1d8] bg-[#faf8f3] px-5 py-4"><h3 className="m-0 text-sm">本次模拟原话</h3><p className="mb-0 mt-1 text-xs text-[#88928c]">你可以依据具体表达修改复盘</p></div><div className="max-h-[520px] space-y-4 overflow-y-auto p-5">{source.messages.map((message) => <ConversationBubble key={message.id} role={message.role === "USER" ? "user" : "companion"}>{message.content}</ConversationBubble>)}</div></Card>
      </aside>
    </div>
  </div>;
}

function Field({ name, label, hint, defaultValue, error, required, tone }: { name: string; label: string; hint?: string; defaultValue: string; error?: string; required?: boolean; tone?: "inference" | "feeling" }) {
  return <label className="block"><span className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">{label}{tone === "inference" && <Badge tone="warm">推测 · 待确认</Badge>}{tone === "feeling" && <Badge tone="sage">用户感受</Badge>}</span>{hint && <span className="mb-2 block text-xs leading-5 text-[#87918b]">{hint}</span>}<textarea name={name} required={required} defaultValue={defaultValue} className="min-h-24 w-full resize-y rounded-2xl border border-[#dfdbd2] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#8da397]" />{error && <span className="mt-1 block text-xs text-[#a24f3b]">{error}</span>}</label>;
}

function Draft({ label, value }: { label: string; value: string }) {
  return <div className="mb-4 last:mb-0"><div className="mb-1 text-xs font-bold text-[#7d8982]">{label}</div><p className="m-0 text-sm leading-6 text-[#5f6c65]">{value}</p></div>;
}
