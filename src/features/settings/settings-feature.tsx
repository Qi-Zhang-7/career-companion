"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Eye, FileClock, Filter, Link2, LockKeyhole, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createMemory, deleteMemory, reviewMemory, toggleMemory } from "@/features/settings/settings-actions";
import type { MemoryFormState, MemoryView, SettingsPageData } from "@/features/settings/settings-types";
import { cn } from "@/lib/utils";

const initialState: MemoryFormState = { status: "idle", message: "" };
const typeLabels: Record<string, string> = { PERSON: "人物", WORK_EVENT: "事件", WORK_PATTERN: "工作模式", PREFERENCE: "偏好", CAREER_GOAL: "职业目标", CAREER_PROFILE: "职业档案", OTHER: "其他" };
const certaintyLabels: Record<string, string> = { FACT: "Fact · 事实", OBSERVATION: "Observation · 观察", INFERENCE: "Inference · 推测", USER_FEELING: "User Feeling · 感受" };
const statusLabels: Record<string, string> = { AUTO_RECORDED: "自动记录", PENDING_EVIDENCE: "证据不足", PENDING_CONFIRMATION: "等待确认", USER_CONFIRMED: "你已确认", USER_CORRECTED: "你已纠正", USER_REJECTED: "你已拒绝", SUPERSEDED: "已被新版本替代" };
const typeIcons: Record<string, typeof Database> = { PERSON: UserRound, WORK_EVENT: FileClock, WORK_PATTERN: Database, CAREER_GOAL: FileClock };

function MemoryToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  return <form action={async (formData) => { await toggleMemory(formData); router.refresh(); }}><input type="hidden" name="enabled" value={String(!enabled)}/><button type="submit" aria-label={enabled ? "关闭长期记忆" : "开启长期记忆"} className={`relative h-7 w-12 cursor-pointer rounded-full border-0 transition ${enabled ? "bg-[#466a5b]" : "bg-[#bbbdb9]"}`}><span className={`absolute top-1 size-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`}/></button></form>;
}

function TextArea({ name, defaultValue, placeholder, error }: { name: string; defaultValue?: string; placeholder?: string; error?: string }) {
  return <label className="block"><textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={5} className="w-full resize-y rounded-2xl border border-[#ddd9cf] bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#a1aaa5] focus:border-[#7e9b8c] focus:ring-2 focus:ring-[#7e9b8c]/15"/>{error && <span className="mt-1.5 block text-xs text-[#a85e48]">{error}</span>}</label>;
}

function MemoryEditor({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const [state, action, pending] = useActionState(createMemory, initialState);
  const router = useRouter();
  const handledSave = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !handledSave.current) {
      handledSave.current = true;
      const timer = window.setTimeout(() => {
        onClose();
        if (state.savedMemoryId) onSaved(state.savedMemoryId);
        router.refresh();
      }, 650);
      return () => window.clearTimeout(timer);
    }
  }, [state.status, state.savedMemoryId, onClose, onSaved, router]);

  return <div className="fixed inset-0 z-50 flex justify-end bg-[#23332d]/28 backdrop-blur-[2px]" role="dialog" aria-modal="true"><button className="absolute inset-0 cursor-default" aria-label="关闭" onClick={onClose}/><div className="relative h-full w-full max-w-[560px] overflow-y-auto border-l border-white/70 bg-[#faf9f5] shadow-[-24px_0_70px_rgba(37,52,45,.16)]"><form action={action} className="min-h-full"><header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e6e1d7] bg-[#faf9f5]/95 px-7 py-6 backdrop-blur"><div><div className="eyebrow">Manual Memory</div><h2 className="mb-1 mt-2 font-serif text-2xl">手动添加一条记忆</h2><p className="m-0 text-sm text-[#78847e]">只有你希望长期保留的信息，才适合放在这里。</p></div><button type="button" onClick={onClose} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-[#efede7] text-[#64736b]" aria-label="关闭"><X size={17}/></button></header>
      <div className="space-y-6 px-7 py-7"><div className="grid grid-cols-2 gap-4"><label><span className="mb-2 block text-xs font-semibold">记忆类型</span><select name="type" defaultValue="WORK_PATTERN" className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3 text-sm"><option value="PERSON">人物</option><option value="WORK_EVENT">事件</option><option value="WORK_PATTERN">工作模式</option><option value="PREFERENCE">偏好</option><option value="CAREER_GOAL">职业目标</option><option value="CAREER_PROFILE">职业档案</option><option value="OTHER">其他</option></select></label><label><span className="mb-2 block text-xs font-semibold">信息性质</span><select name="certainty" defaultValue="FACT" className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3 text-sm"><option value="FACT">Fact · 事实</option><option value="OBSERVATION">Observation · 观察</option><option value="INFERENCE">Inference · 推测</option><option value="USER_FEELING">User Feeling · 感受</option></select></label></div>
        <div><span className="mb-2 block text-xs font-semibold">希望记住的内容 *</span><TextArea name="canonicalText" placeholder="例如：在项目进度存在外部依赖时，我希望先说明依赖，再给出下一次同步节点。" error={state.fieldErrors?.canonicalText}/><p className="mb-0 mt-2 text-xs leading-5 text-[#7c8881]">避免输入客户真实姓名、账号、密钥、未公开合同或其他不必要的敏感信息。</p></div>
        <div className="grid grid-cols-2 gap-4"><label><span className="mb-2 block text-xs font-semibold">重要程度</span><select name="importance" defaultValue="3" className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3 text-sm"><option value="1">1 · 一般</option><option value="2">2</option><option value="3">3 · 重要</option><option value="4">4</option><option value="5">5 · 核心</option></select></label><label><span className="mb-2 block text-xs font-semibold">敏感等级</span><select name="sensitivity" defaultValue="NORMAL" className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3 text-sm"><option value="NORMAL">普通</option><option value="SENSITIVE">敏感</option><option value="HIGHLY_SENSITIVE">高度敏感</option></select></label></div>
        <div className="rounded-2xl bg-[#e9f0ec] p-4 text-xs leading-5 text-[#496357]">手动添加的内容会标记为“你已确认”，来源显示为“用户手动添加”。以后 AI 提取的候选不会自动获得这一状态。</div>
      </div><footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e1d7] bg-[#faf9f5]/95 px-7 py-5 backdrop-blur"><span className={cn("text-xs", state.status === "error" ? "text-[#a85e48]" : "text-[#466a5b]")}>{state.message}</span><div className="flex gap-3"><Button type="button" variant="ghost" onClick={onClose}>取消</Button><Button type="submit" disabled={pending}>{pending ? "正在保存…" : "保存记忆"}</Button></div></footer></form></div></div>;
}

function MemoryDetail({ memory, onClose, onDeleted }: { memory: MemoryView; onClose: () => void; onDeleted: () => void }) {
  const [correcting, setCorrecting] = useState(false);
  const [state, action, pending] = useActionState(reviewMemory, initialState);
  const router = useRouter();
  useEffect(() => { if (state.status === "success") router.refresh(); }, [state.status, router]);
  const reviewable = !["USER_CONFIRMED", "USER_CORRECTED", "USER_REJECTED"].includes(memory.confirmationStatus);

  return <div className="fixed inset-0 z-50 flex justify-end bg-[#23332d]/28 backdrop-blur-[2px]" role="dialog" aria-modal="true"><button className="absolute inset-0 cursor-default" aria-label="关闭" onClick={onClose}/><aside className="relative h-full w-full max-w-[600px] overflow-y-auto border-l border-white/70 bg-[#faf9f5] shadow-[-24px_0_70px_rgba(37,52,45,.16)]"><header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e6e1d7] bg-[#faf9f5]/95 px-7 py-6 backdrop-blur"><div><div className="eyebrow">Memory · v{memory.version}</div><h2 className="mb-1 mt-2 font-serif text-2xl">这条记忆为什么存在</h2><p className="m-0 text-sm text-[#78847e]">可以查看来源、纠正或拒绝。</p></div><button type="button" onClick={onClose} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-[#efede7] text-[#64736b]" aria-label="关闭"><X size={17}/></button></header>
    <div className="space-y-6 px-7 py-7"><section className="rounded-3xl border border-[#e4e0d7] bg-white p-5"><div className="flex flex-wrap gap-2"><Badge>{typeLabels[memory.type] ?? memory.type}</Badge><Badge tone="gold">{certaintyLabels[memory.certainty] ?? memory.certainty}</Badge><Badge tone="neutral">{statusLabels[memory.confirmationStatus] ?? memory.confirmationStatus}</Badge></div><p className="mb-0 mt-4 font-serif text-lg leading-8 text-[#384a41]">{memory.canonicalText}</p><div className="mt-4 flex flex-wrap gap-4 text-xs text-[#87918c]"><span>版本 {memory.version}</span><span>重要程度 {memory.importance}/5</span><span>更新于 {memory.updatedAt}</span><span>敏感等级 {memory.sensitivity}</span></div></section>

      <section><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#718079]"><FileClock size={14}/>来源证据</div>{memory.evidence.length > 0 ? <div className="space-y-3">{memory.evidence.map((evidence) => <div key={evidence.id} className="rounded-2xl border border-[#e5e1d8] p-4"><div className="text-xs font-semibold">{evidence.sourceLabel}</div>{evidence.messageExcerpt && <p className="mb-0 mt-2 text-xs leading-5 text-[#748078]">“{evidence.messageExcerpt}”</p>}<div className="mt-2 text-[11px] text-[#929b96]">记录于 {evidence.createdAt}</div></div>)}</div> : <div className="rounded-2xl border border-dashed border-[#dcd7cc] p-4 text-xs leading-5 text-[#78847e]">用户在 Settings 中手动添加并确认。目前没有关联对话或事件证据。</div>}</section>

      <section><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#718079]"><Link2 size={14}/>关联实体</div>{memory.links.length > 0 ? <div className="flex flex-wrap gap-2">{memory.links.map((link) => <Badge key={link.id} tone="neutral">{link.entityLabel}</Badge>)}</div> : <p className="text-xs text-[#87918c]">还没有关联人物、事件或成长主题。</p>}</section>

      <form action={action} className="rounded-2xl bg-[#f1f3ef] p-4"><input type="hidden" name="memoryId" value={memory.id}/>{correcting && <TextArea name="correctedText" defaultValue={memory.canonicalText}/>}<div className={cn("flex flex-wrap gap-2", correcting && "mt-3")}>{correcting ? <><Button type="submit" name="decision" value="CORRECT" disabled={pending}>保存纠正</Button><Button type="button" variant="ghost" onClick={() => setCorrecting(false)}>取消</Button></> : <><Button type="button" variant="outline" onClick={() => setCorrecting(true)}><Pencil size={14}/>纠正内容</Button>{reviewable && <Button type="submit" name="decision" value="CONFIRM" disabled={pending}>确认准确</Button>}<Button type="submit" name="decision" value="REJECT" variant="ghost" disabled={pending}>拒绝这条记忆</Button></>}</div>{state.message && <p className={`mb-0 mt-3 text-xs ${state.status === "error" ? "text-[#a85e48]" : "text-[#466a5b]"}`}>{state.message}</p>}</form>

      <form action={deleteMemory} onSubmit={(event) => { if (!window.confirm("确定删除这条记忆吗？删除后不会再用于后续陪伴。")) event.preventDefault(); else { onDeleted(); onClose(); } }}><input type="hidden" name="memoryId" value={memory.id}/><button type="submit" className="flex cursor-pointer items-center gap-2 border-0 bg-transparent py-2 text-xs text-[#a2604b] hover:underline"><Trash2 size={14}/>删除这条记忆</button></form>
    </div></aside></div>;
}

export function SettingsFeature({ data }: { data: SettingsPageData }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const closeEditor = useCallback(() => setAdding(false), []);
  const handleMemorySaved = useCallback((id: string) => setSelectedId(id), []);
  const closeDetail = useCallback(() => setSelectedId(null), []);
  const selected = data.memories.find((memory) => memory.id === selectedId) ?? null;
  const types = useMemo(() => [...new Set(data.memories.map((memory) => memory.type))], [data.memories]);
  const filtered = data.memories.filter((memory) => (typeFilter === "ALL" || memory.type === typeFilter) && memory.canonicalText.toLowerCase().includes(query.trim().toLowerCase()));

  return <div className="page-content fade-in"><PageHeader eyebrow="Settings" title={`${data.user.displayName}的记忆与隐私`} subtitle="这是你的私人职场空间。你决定什么可以被记住，也可以随时查看、纠正或删除。" action={<Button variant="outline" onClick={() => setAdding(true)}><Plus size={15}/>手动添加记忆</Button>}/>
    <div className="grid grid-cols-[.65fr_1.35fr] gap-5 max-[860px]:grid-cols-1"><aside className="space-y-3"><Card className="p-5"><div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e5eee9] text-[#466a5b]"><ShieldCheck size={19}/></span><div><div className="font-semibold">长期记忆</div><div className="text-xs text-[#7b8780]">由你控制</div></div></div><div className="flex items-center justify-between rounded-2xl bg-[#f3f1eb] p-4"><span className="text-sm">允许新的记忆</span><MemoryToggle enabled={data.user.memoryEnabled}/></div><p className="mb-0 mt-4 text-xs leading-5 text-[#7a8680]">关闭后，对话仍能使用当前会话的临时上下文，但不会产生新的长期记忆候选。已有记忆不会被删除。</p></Card>
      <Card className="p-5"><div className="mb-3 flex items-center gap-2 font-semibold"><LockKeyhole size={17}/>隐私原则</div><p className="m-0 text-xs leading-5 text-[#748078]">避免输入公司机密和第三方敏感信息。长期记忆必须能够查看来源，并允许确认、纠正、拒绝和删除。</p></Card>
      <Card className="p-5"><div className="text-xs text-[#7b8780]">当前有效记忆</div><div className="mt-2 font-serif text-3xl text-[#3d584c]">{data.memories.length}</div><p className="mb-0 mt-2 text-xs text-[#87918c]">拒绝的记忆会保留状态，但不会作为已确认事实使用。</p></Card></aside>

      <Card className="p-7"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="section-title">被记住的信息</h2><p className="mb-0 mt-2 text-sm text-[#78847e]">每条记忆都有类型、状态和来源。</p></div><div className="flex gap-2"><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#87918c]" size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索记忆" className="h-10 w-44 rounded-full border border-[#ddd9cf] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#7e9b8c]"/></label><label className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#87918c]" size={14}/><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 appearance-none rounded-full border border-[#ddd9cf] bg-white pl-9 pr-7 text-sm outline-none"><option value="ALL">全部类型</option>{types.map((type) => <option key={type} value={type}>{typeLabels[type] ?? type}</option>)}</select></label></div></div>

      {filtered.length > 0 ? <div className="space-y-3">{filtered.map((memory) => { const Icon = typeIcons[memory.type] ?? Database; return <div key={memory.id} className={cn("flex items-center justify-between gap-4 rounded-2xl border border-[#e5e1d8] p-5 max-[600px]:items-start", memory.confirmationStatus === "USER_REJECTED" && "border-dashed opacity-60")}><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef1ed] text-[#466a5b]"><Icon size={18}/></span><div><div className="flex flex-wrap gap-2"><Badge>{typeLabels[memory.type] ?? memory.type}</Badge><Badge tone="gold">{certaintyLabels[memory.certainty] ?? memory.certainty}</Badge><Badge tone="neutral">{statusLabels[memory.confirmationStatus] ?? memory.confirmationStatus}</Badge></div><h3 className="mb-1 mt-2 text-sm leading-6">{memory.canonicalText}</h3><p className="m-0 text-xs text-[#858f89]">{memory.evidence.length > 0 ? `${memory.evidence.length} 条来源证据` : "用户手动添加"} · 版本 {memory.version} · 更新于 {memory.updatedAt}</p></div></div><button onClick={() => setSelectedId(memory.id)} title="查看来源与管理" className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#7b8780] hover:bg-[#efede7]"><Eye size={16}/></button></div>; })}</div> : <div className="grid min-h-[330px] place-items-center rounded-3xl border border-dashed border-[#dcd7cc] bg-[#fbfaf7] text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf1ed] text-[#466a5b]"><Database size={22}/></span><h3 className="mb-1 mt-4 text-base">{data.memories.length === 0 ? "还没有长期记忆" : "没有符合条件的记忆"}</h3><p className="m-0 max-w-sm text-sm leading-6 text-[#7c8881]">{data.memories.length === 0 ? "以后你确认保存的信息会出现在这里。现在可以手动添加一条，用来测试完整流程。" : "试着清除搜索词或切换记忆类型。"}</p>{data.memories.length === 0 && <Button className="mt-5" onClick={() => setAdding(true)}><Plus size={15}/>添加第一条记忆</Button>}</div></div>}
      </Card></div>
    {adding && <MemoryEditor onClose={closeEditor} onSaved={handleMemorySaved}/>} 
    {selected && <MemoryDetail memory={selected} onClose={closeDetail} onDeleted={closeDetail}/>} 
  </div>;
}
