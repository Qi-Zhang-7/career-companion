"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, CircleDot, MessageSquareText, Network, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deletePerson, reviewObservation, savePerson } from "@/features/people/people-actions";
import type { PeopleFormState, PeoplePageData, PersonObservationView, PersonView } from "@/features/people/people-types";
import { cn } from "@/lib/utils";

const initialState: PeopleFormState = { status: "idle", message: "" };
const positions = [
  { x: 50, y: 14 }, { x: 82, y: 31 }, { x: 83, y: 69 }, { x: 50, y: 85 },
  { x: 18, y: 69 }, { x: 17, y: 31 }, { x: 68, y: 50 }, { x: 32, y: 50 },
];
const colors: Record<string, string> = { 领导: "#6f8178", 项目: "#b76e54", 同事: "#718c83", 开发: "#70889b", 客户: "#a58555", HR: "#8a7e98" };
const kindMeta: Record<string, { label: string; tone: "sage" | "gold" | "neutral" | "warm" }> = {
  FACT: { label: "Fact · 事实", tone: "sage" },
  OBSERVATION: { label: "Observation · 观察", tone: "gold" },
  INFERENCE: { label: "Inference · 推测", tone: "neutral" },
  USER_FEELING: { label: "User Feeling · 我的感受", tone: "warm" },
  COMMUNICATION_PREFERENCE: { label: "Communication Preference", tone: "gold" },
  EFFECTIVE_STRATEGY: { label: "Effective Strategy", tone: "sage" },
};
const confirmationLabels: Record<string, string> = {
  AUTO_RECORDED: "自动记录",
  PENDING_EVIDENCE: "证据不足",
  PENDING_CONFIRMATION: "等待确认",
  USER_CONFIRMED: "你已确认",
  USER_CORRECTED: "你已纠正",
  USER_REJECTED: "你已拒绝",
  SUPERSEDED: "已被新版本替代",
};
const relationshipLabels: Record<string, string> = {
  PROJECT_LEAD: "项目负责人",
  CORE_COLLABORATOR: "核心协作方",
  CLIENT_APPROVER: "客户决策方",
  DIRECT_MANAGER: "直属领导",
  COLLEAGUE: "同事",
  WORK_CONTACT: "工作联系人",
};

function Field({ label, name, defaultValue, placeholder, error, type = "text" }: {
  label: string; name: string; defaultValue?: string | number | null; placeholder?: string; error?: string; type?: "text" | "number";
}) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-[#5f6f67]">{label}</span><input name={name} type={type} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#a1aaa5] focus:border-[#7e9b8c] focus:ring-2 focus:ring-[#7e9b8c]/15"/>{error && <span className="mt-1.5 block text-xs text-[#a85e48]">{error}</span>}</label>;
}

function TextArea({ label, name, defaultValue, placeholder, error }: { label: string; name: string; defaultValue?: string | null; placeholder?: string; error?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-[#5f6f67]">{label}</span><textarea name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} rows={3} className="w-full resize-y rounded-xl border border-[#ddd9cf] bg-white px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-[#a1aaa5] focus:border-[#7e9b8c] focus:ring-2 focus:ring-[#7e9b8c]/15"/>{error && <span className="mt-1.5 block text-xs text-[#a85e48]">{error}</span>}</label>;
}

function PersonEditor({ person, onClose, onSaved }: { person: PersonView | null; onClose: () => void; onSaved: (personId: string) => void }) {
  const [state, action, pending] = useActionState(savePerson, initialState);
  const router = useRouter();
  const strategy = person?.strategies[0];
  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      if (state.savedPersonId) onSaved(state.savedPersonId);
      const timer = window.setTimeout(onClose, 1100);
      return () => window.clearTimeout(timer);
    }
  }, [state.status, state.savedPersonId, onClose, onSaved, router]);

  return <div className="fixed inset-0 z-50 flex justify-end bg-[#23332d]/28 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label={person ? "编辑人物" : "添加人物"}>
    <button className="absolute inset-0 cursor-default" aria-label="关闭" onClick={onClose}/>
    <div className="relative h-full w-full max-w-[620px] overflow-y-auto border-l border-white/70 bg-[#faf9f5] shadow-[-24px_0_70px_rgba(37,52,45,.16)]">
      <form action={action} className="min-h-full">
        <input type="hidden" name="personId" value={person?.id ?? ""}/>
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e6e1d7] bg-[#faf9f5]/95 px-7 py-6 backdrop-blur"><div><div className="eyebrow">Workplace Map</div><h2 className="mb-1 mt-2 font-serif text-2xl text-[#2f4038]">{person ? `编辑 ${person.displayName}` : "添加职场人物"}</h2><p className="m-0 text-sm text-[#78847e]">使用别名也可以，避免记录不必要的敏感信息。</p></div><button type="button" onClick={onClose} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-[#efede7] text-[#64736b]" aria-label="关闭"><X size={17}/></button></header>

        <div className="space-y-7 px-7 py-7">
          <section><h3 className="mb-4 text-sm font-semibold">人物与关系</h3><div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
            <Field label="人物称呼 / 别名 *" name="displayName" defaultValue={person?.displayName} placeholder="例如：张经理" error={state.fieldErrors?.displayName}/>
            <Field label="Role" name="roleTitle" defaultValue={person?.roleTitle} placeholder="例如：项目经理" error={state.fieldErrors?.roleTitle}/>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-[#5f6f67]">人物分组</span><select name="groupType" defaultValue={person?.groupType ?? "项目"} className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3.5 text-sm outline-none"><option>领导</option><option>项目</option><option>同事</option><option>开发</option><option>客户</option><option>HR</option></select></label>
            <Field label="组织 / 项目别名" name="organizationAlias" defaultValue={person?.organizationAlias} placeholder="例如：当前政务项目" error={state.fieldErrors?.organizationAlias}/>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-[#5f6f67]">Relationship</span><select name="relationshipType" defaultValue={person?.relationship?.relationshipType ?? "WORK_CONTACT"} className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3.5 text-sm outline-none"><option value="DIRECT_MANAGER">直属领导</option><option value="PROJECT_LEAD">项目负责人</option><option value="CORE_COLLABORATOR">核心协作方</option><option value="CLIENT_APPROVER">客户决策方</option><option value="COLLEAGUE">同事</option><option value="WORK_CONTACT">工作联系人</option></select></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-[#5f6f67]">影响程度</span><select name="influenceLevel" defaultValue={person?.relationship?.influenceLevel ?? ""} className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3.5 text-sm outline-none"><option value="">暂不判断</option><option value="1">1 · 较低</option><option value="2">2</option><option value="3">3 · 中等</option><option value="4">4</option><option value="5">5 · 很高</option></select>{state.fieldErrors?.influenceLevel && <span className="mt-1.5 block text-xs text-[#a85e48]">{state.fieldErrors.influenceLevel}</span>}</label>
          </div><div className="mt-4 space-y-4"><TextArea label="Relationship Summary" name="communicationSummary" defaultValue={person?.relationship?.communicationSummary} placeholder="只写当前已知的协作关系，不做人格判断。"/><TextArea label="我的备注" name="notes" defaultValue={person?.notes} placeholder="可选，仅自己可见。"/></div></section>

          <section className="border-t border-[#e7e2d8] pt-6"><h3 className="mb-1 text-sm font-semibold">Communication Strategy</h3><p className="mb-4 mt-0 text-xs text-[#7c8881]">记录已经尝试或准备验证的策略，不把它写成人格定论。</p><div className="space-y-4"><Field label="适用情境" name="strategyContext" defaultValue={strategy?.context} placeholder="例如：项目进度被催时"/><TextArea label="策略" name="strategy" defaultValue={strategy?.strategy} placeholder="例如：先说结论和节点，再说明依赖。"/></div></section>

          <section className="border-t border-[#e7e2d8] pt-6"><h3 className="mb-1 text-sm font-semibold">新增一条已确认信息（可选）</h3><p className="mb-4 mt-0 text-xs leading-5 text-[#7c8881]">这是你主动填写的内容，会标记为“你已确认”。推测请仍然选择 Inference。</p><div className="space-y-4"><label className="block"><span className="mb-2 block text-xs font-semibold text-[#5f6f67]">信息类型</span><select name="observationKind" defaultValue="" className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3.5 text-sm outline-none"><option value="">这次不新增</option><option value="FACT">Fact · 事实</option><option value="OBSERVATION">Observation · 观察</option><option value="INFERENCE">Inference · 推测</option><option value="USER_FEELING">User Feeling · 我的感受</option><option value="COMMUNICATION_PREFERENCE">Communication Preference</option></select></label><TextArea label="具体内容" name="observationContent" placeholder="写清具体行为或事件，避免“强势”“难沟通”等标签。" error={state.fieldErrors?.observationContent}/></div></section>

          {state.message && <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${state.status === "success" ? "bg-[#e5eee9] text-[#355447]" : "bg-[#f8e9e3] text-[#9a5742]"}`}>{state.status === "success" && <CheckCircle2 size={16}/>} {state.message}</div>}
        </div>
        <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e1d7] bg-[#faf9f5]/95 px-7 py-5 backdrop-blur"><span className={cn("text-xs", state.status === "error" ? "text-[#a85e48]" : "text-[#466a5b]")}>{state.message}</span><div className="flex gap-3"><Button type="button" variant="ghost" onClick={onClose}>取消</Button><Button type="submit" disabled={pending}>{pending ? "正在保存…" : "保存人物"}</Button></div></footer>
      </form>
    </div>
  </div>;
}

function EvidenceCard({ observation }: { observation: PersonObservationView }) {
  const [correcting, setCorrecting] = useState(false);
  const [state, action, pending] = useActionState(reviewObservation, initialState);
  const meta = kindMeta[observation.kind] ?? { label: observation.kind, tone: "neutral" as const };
  const canReview = observation.confirmationStatus === "PENDING_CONFIRMATION" || observation.confirmationStatus === "PENDING_EVIDENCE" || observation.confirmationStatus === "AUTO_RECORDED";

  return <div className={cn("rounded-2xl border p-4", observation.confirmationStatus === "USER_REJECTED" ? "border-dashed border-[#ddd9cf] opacity-60" : "border-[#e8e4dc]")}>
    <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone={meta.tone}>{meta.label}</Badge><span className="text-[11px] text-[#849089]">{confirmationLabels[observation.confirmationStatus] ?? observation.confirmationStatus} · {observation.evidenceCount} 条证据</span></div>
    <p className="mb-0 mt-2 text-xs leading-5 text-[#66736c]">{observation.content}</p>
    {canReview && <form action={action} className="mt-3 border-t border-[#eeeae2] pt-3"><input type="hidden" name="observationId" value={observation.id}/>{correcting && <textarea name="correctedContent" defaultValue={observation.content} rows={2} className="mb-3 w-full rounded-xl border border-[#ddd9cf] bg-white px-3 py-2 text-xs leading-5 outline-none focus:border-[#7e9b8c]"/>}<div className="flex flex-wrap gap-2">{correcting ? <><Button size="sm" type="submit" name="decision" value="CORRECT" disabled={pending}>保存纠正</Button><Button size="sm" type="button" variant="ghost" onClick={() => setCorrecting(false)}>取消</Button></> : <><Button size="sm" type="submit" name="decision" value="CONFIRM" disabled={pending}>符合</Button><Button size="sm" type="button" variant="outline" onClick={() => setCorrecting(true)}>部分符合，纠正</Button><Button size="sm" type="submit" name="decision" value="REJECT" variant="ghost" disabled={pending}>不符合</Button></>}</div>{state.message && <p className={`mb-0 mt-2 text-xs ${state.status === "error" ? "text-[#a85e48]" : "text-[#466a5b]"}`}>{state.message}</p>}</form>}
  </div>;
}

function PersonDetail({ person, onEdit, onDeleted }: { person: PersonView; onEdit: () => void; onDeleted: () => void }) {
  return <Card className="p-6 max-[920px]:min-h-0"><div className="mb-5 flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl text-lg font-bold text-white" style={{ background: colors[person.groupType ?? ""] ?? "#71847b" }}>{person.displayName.slice(0, 1)}</span><div><h2 className="m-0 text-lg">{person.displayName}</h2><p className="mb-0 mt-1 text-xs text-[#7d8982]">{person.roleTitle ?? "Role 待填写"} · {relationshipLabels[person.relationship?.relationshipType ?? ""] ?? "关系待填写"}</p></div></div><button onClick={onEdit} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-[#f0eee8] text-[#64736b]" title="编辑人物"><Pencil size={15}/></button></div>

    {person.organizationAlias && <div className="mb-4 rounded-xl bg-[#f1f3ef] px-3 py-2 text-xs text-[#68766f]">所属空间 · {person.organizationAlias}</div>}
    <div className="space-y-3">{person.observations.length > 0 ? person.observations.map((observation) => <EvidenceCard key={observation.id} observation={observation}/>) : <div className="rounded-2xl border border-dashed border-[#ddd9cf] p-4 text-xs leading-5 text-[#7c8881]">还没有人物观察。可以先添加一条事实或你的真实感受。</div>}</div>

    <div className="mt-6 border-t border-[#e9e5dd] pt-5"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#718079]"><CalendarDays size={14}/>Recent Events</div>{person.events.length > 0 ? person.events.map((event) => <div key={event.id} className="mb-3 flex gap-2 text-xs leading-5 text-[#6f7b75]"><CircleDot size={12} className="mt-1 shrink-0 text-[#b76e54]"/><div><strong className="font-semibold text-[#46554d]">{event.date} · {event.title}</strong><p className="mb-0 mt-1">{event.facts}</p></div></div>) : <p className="text-xs text-[#87918c]">还没有关联的真实事件。</p>}</div>

    <div className="mt-5 border-t border-[#e9e5dd] pt-5"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#718079]"><MessageSquareText size={14}/>Effective Strategies</div>{person.strategies.length > 0 ? person.strategies.map((strategy) => <div key={strategy.id} className="mb-3 rounded-2xl bg-[#e9f0ec] p-4"><div className="flex items-center justify-between gap-2 text-xs font-bold text-[#466a5b]"><span>{strategy.context}</span><span>{strategy.evidenceCount} 条证据</span></div><p className="mb-0 mt-2 text-sm leading-6">{strategy.strategy}</p></div>) : <p className="text-xs text-[#87918c]">还没有经过实践验证的沟通策略。</p>}</div>

    <Button className="mt-3 w-full" variant="outline" asChild><Link href={`/roleplay?personId=${person.id}`}>和 {person.displayName} 练一次 <ArrowRight size={15}/></Link></Button>
    <form action={deletePerson} onSubmit={(event) => { if (!window.confirm(`确定从职场地图中移除“${person.displayName}”吗？历史事件仍会保留。`)) event.preventDefault(); else onDeleted(); }} className="mt-3"><input type="hidden" name="personId" value={person.id}/><button type="submit" className="flex w-full cursor-pointer items-center justify-center gap-2 border-0 bg-transparent py-2 text-xs text-[#a2604b] hover:underline"><Trash2 size={14}/>从职场地图中移除</button></form>
  </Card>;
}

export function PeopleFeature({ data }: { data: PeoplePageData }) {
  const [selectedId, setSelectedId] = useState<string | null>(data.people[0]?.id ?? null);
  const [editor, setEditor] = useState<"new" | "edit" | null>(null);
  const selected = data.people.find((person) => person.id === selectedId) ?? data.people[0] ?? null;
  const mapPeople = useMemo(() => data.people.map((person, index) => ({ ...person, position: positions[index % positions.length] })), [data.people]);

  return <div className="page-content fade-in"><PageHeader eyebrow="Workplace Map" title="我的职场关系" subtitle="看见每个人，也看见你们之间反复发生的互动。事实、观察与推测会被清楚区分。" action={<Button variant="outline" onClick={() => setEditor("new")}><Plus size={16}/>添加人物</Button>}/>
    <div className="grid grid-cols-[1.2fr_.8fr] gap-5 max-[920px]:grid-cols-1"><Card className="relative min-h-[650px] overflow-hidden p-6"><div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#bfc8c1 1px, transparent 1px)", backgroundSize: "24px 24px" }}/><div className="relative z-10 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><Network size={17} className="text-[#466a5b]"/>关系地图</div><Badge tone="neutral">{data.people.length} 位重要人物</Badge></div>
      {data.people.length > 0 ? <div className="relative mx-auto mt-6 aspect-square max-w-[590px]"><svg className="absolute inset-0 size-full opacity-60" viewBox="0 0 100 100">{mapPeople.map((person) => <line key={person.id} x1="50" y1="48" x2={person.position.x} y2={person.position.y} stroke={selected?.id === person.id ? "#b76e54" : "#b9c4bd"} strokeWidth={selected?.id === person.id ? ".8" : ".45"} strokeDasharray={selected?.id === person.id ? "0" : "2 2"}/>)}</svg><div className="absolute left-1/2 top-[48%] grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-[#466a5b] text-center text-white shadow-xl"><div><strong className="block text-lg">我</strong><small>{data.currentUser.currentRole ?? data.currentUser.displayName}</small></div></div>{mapPeople.map((person) => <button key={person.id} onClick={() => setSelectedId(person.id)} className={cn("absolute grid size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-[3px] bg-white text-center shadow-md transition hover:scale-105", selected?.id === person.id ? "border-[#b76e54] ring-4 ring-[#f4e3db]" : "border-white")} style={{ left: `${person.position.x}%`, top: `${person.position.y}%` }}><span className="grid size-11 place-items-center rounded-full text-sm font-bold text-white" style={{ background: colors[person.groupType ?? ""] ?? "#71847b" }}>{person.displayName.slice(0, 1)}</span><span className="absolute top-[64px] whitespace-nowrap rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold shadow-sm">{person.displayName} · {person.groupType ?? "未分组"}</span></button>)}</div> : <div className="relative z-10 grid min-h-[520px] place-items-center text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf1ed] text-[#466a5b]"><UserRound size={23}/></span><h2 className="mb-1 mt-4 text-base">你的职场地图还是空的</h2><p className="m-0 text-sm text-[#7c8881]">先添加一位最近经常协作的人。</p><Button className="mt-5" onClick={() => setEditor("new")}><Plus size={16}/>添加人物</Button></div></div>}
    </Card>
    {selected ? <PersonDetail person={selected} onEdit={() => setEditor("edit")} onDeleted={() => setSelectedId(null)}/> : <Card className="grid min-h-[300px] place-items-center p-6 text-sm text-[#7c8881]">选择一个人物查看详情</Card>}</div>
    {editor && <PersonEditor person={editor === "edit" ? selected : null} onClose={() => setEditor(null)} onSaved={(personId) => setSelectedId(personId)}/>} 
  </div>;
}
