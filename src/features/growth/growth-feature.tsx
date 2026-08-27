"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, BookOpenCheck, Check, CheckCircle2, CircleDot, Clock3, Footprints, History, Lightbulb, LockKeyhole, Sparkles, Sprout, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GrowthPageData, GrowthReportView } from "@/features/growth/growth-types";

const themeStatus: Record<string, string> = { ACTIVE: "正在练习", IMPROVING: "已有变化", EMERGING: "刚刚浮现", PENDING_CONFIRMATION: "待你确认", DORMANT: "暂时搁置", RESOLVED: "相对稳定" };
const sourceLabel: Record<string, string> = { USER_CREATED: "你主动创建", AI_SUGGESTED: "陪伴师建议", CO_CREATED: "你与陪伴师共同形成", REFLECTION_DERIVED: "从真实复盘中形成" };
const confirmationLabel: Record<string, string> = { USER_CONFIRMED: "已由你确认", PENDING_CONFIRMATION: "等待你确认", PENDING_EVIDENCE: "仍在积累证据" };

export function GrowthFeature({ data }: { data: GrowthPageData }) {
  const [themeId, setThemeId] = useState(data.themes[0]?.id);
  const [reportId, setReportId] = useState(data.reports.at(-1)?.id);
  const [patternChoice, setPatternChoice] = useState<string>();
  const selectedTheme = useMemo(() => data.themes.find((theme) => theme.id === themeId) ?? data.themes[0], [data.themes, themeId]);
  const selectedReport = useMemo(() => data.reports.find((report) => report.id === reportId) ?? data.reports.at(-1), [data.reports, reportId]);
  const firstConfirmed = data.reports.find((report) => report.status === "CONFIRMED");
  const latestReport = data.reports.at(-1);

  return <div className="page-content fade-in">
    <PageHeader eyebrow="Growth · 来自你的真实记录" title="把变化放回时间里看" subtitle={`${data.userName}，这里不为你打分。每个结论都来自真实事件，每份正式回顾都会保留当时的版本。`} action={<Badge tone="neutral" className="gap-2 px-4 py-2"><LockKeyhole size={13}/>数据库实时数据</Badge>}/>

    <section className="mb-7 grid grid-cols-[330px_1fr] gap-5 max-[900px]:grid-cols-1">
      <div>
        <div className="mb-4 flex items-end justify-between"><div><div className="eyebrow">Growth Themes</div><h2 className="section-title mt-2">我正在练习什么</h2></div></div>
        <div className="space-y-3">{data.themes.map((theme, index) => <button key={theme.id} onClick={() => setThemeId(theme.id)} className={cn("w-full cursor-pointer rounded-[22px] border p-5 text-left transition", theme.id === selectedTheme.id ? "border-[#6f8e7e] bg-[#edf3ef] shadow-[0_12px_30px_rgba(70,106,91,.1)]" : "border-[#e1ddd4] bg-white/70 hover:border-[#aebdb5]")}><div className="mb-4 flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-white text-[#466a5b] shadow-sm"><Sprout size={17}/></span><Badge tone={index === 0 ? "warm" : "sage"}>{themeStatus[theme.status] ?? theme.status}</Badge></div><h3 className="my-0 text-base">{theme.title}</h3><p className="mb-0 mt-2 line-clamp-2 text-xs leading-5 text-[#748078]">{theme.description}</p><div className="mt-4 flex items-center gap-2 text-[11px] text-[#859089]"><History size={12}/>{theme.evidenceCount} 个关联证据</div></button>)}</div>
      </div>

      {selectedTheme && <Card className="overflow-hidden">
        <div className="border-b border-[#e4e0d8] bg-[linear-gradient(135deg,#fbfaf7,#edf3ef)] p-7"><div className="mb-3 flex flex-wrap gap-2"><Badge>{sourceLabel[selectedTheme.source] ?? selectedTheme.source}</Badge><Badge tone="gold">{confirmationLabel[selectedTheme.confirmationStatus] ?? selectedTheme.confirmationStatus}</Badge></div><h2 className="mb-2 mt-0 font-serif text-[30px] font-medium">{selectedTheme.title}</h2><p className="m-0 max-w-2xl text-sm leading-6 text-[#68766f]">{selectedTheme.description}</p></div>
        <div className="p-7">
          <div className="mb-7 rounded-2xl bg-[#faf3ef] p-5"><div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#9e6049]"><Lightbulb size={15}/>为什么形成这个主题</div><p className="m-0 text-sm leading-7">{selectedTheme.originSummary}</p></div>
          <div className="mb-4 flex items-center justify-between"><h3 className="m-0 font-serif text-xl font-medium">关键事件时间轴</h3><span className="text-xs text-[#89938d]">{selectedTheme.timeline.length} 个真实事件</span></div>
          <div className="relative ml-2 border-l border-[#cfd8d2] pl-7">{selectedTheme.timeline.length ? selectedTheme.timeline.map((event, index) => <div key={event.id} className="relative pb-7 last:pb-0"><span className={cn("absolute -left-[35px] top-1 grid size-4 place-items-center rounded-full border-[3px] border-[#fbfaf7]", index === selectedTheme.timeline.length - 1 ? "bg-[#b76e54]" : "bg-[#739281]")}/><div className="mb-2 flex flex-wrap items-center gap-2"><strong className="text-sm">{event.date}</strong>{event.people.map((person) => <Badge key={person} tone="neutral">{person}</Badge>)}</div><h4 className="mb-2 mt-0 text-sm">{event.title}</h4><p className="mb-3 text-xs leading-5 text-[#77837c]">{event.facts}</p>{event.response && <div className="rounded-xl bg-[#f1f3ef] px-4 py-3 text-xs leading-5"><span className="font-semibold text-[#466a5b]">这次的做法：</span>{event.response}</div>}{event.outcome && <p className="mb-0 mt-2 text-xs leading-5 text-[#7b8680]"><span className="font-semibold">结果：</span>{event.outcome}</p>}</div>) : <p className="text-sm text-[#87918c]">正在积累相关事件。</p>}</div>
        </div>
      </Card>}
    </section>

    {firstConfirmed?.theme && latestReport?.theme && <Card className="mb-7 overflow-hidden"><div className="border-b border-[#e5e1d9] p-7"><div className="eyebrow">Interaction Change</div><h2 className="section-title mt-2">同一个场景，我开始有了不同的选择</h2><p className="mb-0 mt-2 text-sm text-[#77847d]">不是变得“不焦虑”，而是焦虑出现后，多做了一步判断。</p></div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 p-7 max-[700px]:grid-cols-1"><PatternPanel label={`${firstConfirmed.month} · 当时`} pattern={firstConfirmed.theme.pastPattern} tone="warm"/><ArrowRight className="text-[#9aaba2] max-[700px]:hidden"/><PatternPanel label={`${latestReport.month} · 最近`} pattern={latestReport.theme.recentPattern} tone="sage"/></div><div className="grid grid-cols-2 gap-4 border-t border-[#e5e1d9] bg-[#faf8f4] p-6 max-[700px]:grid-cols-1"><div><div className="mb-2 text-xs font-bold text-[#466a5b]">目前有效的策略</div><p className="m-0 text-sm leading-6">{latestReport.theme.effectiveStrategy ?? "仍在积累真实行动结果"}</p></div><div><div className="mb-2 text-xs font-bold text-[#b1664d]">下一步实验</div><p className="m-0 text-sm leading-6">{latestReport.theme.nextExperiment}</p></div></div></Card>}

    <section className="mb-7"><div className="mb-4 flex items-end justify-between gap-4"><div><div className="eyebrow">Growth History</div><h2 className="section-title mt-2">阶段回顾与历史快照</h2></div><div className="flex gap-2"><Badge tone="neutral">周报 · 即将开放</Badge><Badge>月报</Badge><Badge tone="neutral">季度 · 即将开放</Badge></div></div><Card className="overflow-hidden"><div className="grid grid-cols-[220px_1fr] max-[800px]:grid-cols-1"><aside className="border-r border-[#e5e1d9] bg-[#f7f5f0] p-4 max-[800px]:border-b max-[800px]:border-r-0"><div className="mb-3 px-2 text-xs font-bold text-[#7c8881]">报告时间轴</div><div className="space-y-2 max-[800px]:flex max-[800px]:overflow-auto">{data.reports.map((report) => <button key={report.id} onClick={() => setReportId(report.id)} className={cn("w-full cursor-pointer rounded-xl border-0 px-4 py-3 text-left transition max-[800px]:min-w-44", report.id === selectedReport?.id ? "bg-white text-[#39584b] shadow-sm" : "bg-transparent text-[#748078] hover:bg-white/60")}><div className="flex items-center justify-between gap-2"><strong className="text-sm">{report.month}</strong>{report.status === "CONFIRMED" ? <CheckCircle2 size={14} className="text-[#5b836f]"/> : <Clock3 size={14} className="text-[#b76e54]"/>}</div><small className="mt-1 block">{report.status === "CONFIRMED" ? `正式快照 · v${report.version}` : "本月草稿"}</small></button>)}</div></aside>{selectedReport && <ReportSnapshot report={selectedReport}/>}</div></Card></section>

    <div className="grid-2"><Card className="p-7"><div className="mb-4 flex items-center gap-2"><Sparkles size={18} className="text-[#b88b45]"/><h2 className="section-title">可能的共同模式</h2></div><p className="text-sm leading-7 text-[#627068]">不同的人把事情说得很急时，你似乎容易先承担下来，再考虑自己的容量。</p><p className="text-sm font-semibold">你自己有这种感觉吗？</p><div className="flex flex-wrap gap-2">{["是，有这种感觉","部分符合","不太符合"].map((choice) => <Button key={choice} size="sm" variant={patternChoice === choice ? "primary" : "outline"} onClick={() => setPatternChoice(choice)}>{patternChoice === choice && <Check size={14}/>} {choice}</Button>)}</div></Card><Card className="p-7"><div className="mb-4 flex items-center gap-2"><Footprints size={18} className="text-[#466a5b]"/><h2 className="section-title">关于报告快照</h2></div><p className="text-sm leading-7 text-[#627068]">正式确认后的月报不会随最新模型改变。新的证据只会进入下一份报告，或生成一个新的修订版本。</p><div className="rounded-2xl bg-[#e9f0ec] p-4 text-xs leading-5"><strong className="text-[#466a5b]">为什么这样设计</strong><br/>你看到的是“当时的我如何理解和处理”，而不是被 AI 事后重写的成长故事。</div></Card></div>
  </div>;
}

function PatternPanel({ label, pattern, tone }: { label: string; pattern: string | null; tone: "warm" | "sage" }) {
  const steps = pattern?.split("→").map((item) => item.trim()) ?? ["正在积累证据"];
  return <div className="rounded-2xl bg-[#faf9f6] p-5"><Badge tone={tone}>{label}</Badge><div className="mt-4 space-y-2">{steps.map((step, index) => <div key={`${step}-${index}`}><div className="rounded-xl border border-[#e4e0d8] bg-white px-4 py-3 text-sm">{step}</div>{index < steps.length - 1 && <ArrowDown size={14} className="mx-auto my-1 text-[#a3ada8]"/>}</div>)}</div></div>;
}

function ReportSnapshot({ report }: { report: GrowthReportView }) {
  return <article className="p-7"><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><Badge tone={report.status === "CONFIRMED" ? "sage" : "warm"}>{report.status === "CONFIRMED" ? "正式快照" : "待确认草稿"}</Badge><span className="text-xs text-[#859089]">版本 {report.version}</span></div><h3 className="mb-1 mt-0 font-serif text-2xl font-medium">{report.month}成长回顾</h3><p className="m-0 text-xs text-[#87918c]">{report.period}{report.confirmedAt ? ` · ${report.confirmedAt} 确认` : " · 尚未锁定"}</p></div>{report.status === "CONFIRMED" && <div className="flex items-center gap-2 rounded-full bg-[#edf3ef] px-3 py-2 text-xs font-semibold text-[#466a5b]"><LockKeyhole size={13}/>历史内容已锁定</div>}</div><blockquote className="m-0 rounded-2xl border-l-4 border-[#789686] bg-[#f1f5f2] px-5 py-4 text-sm leading-7">{report.summary}</blockquote>{report.theme && <div className="mt-6 grid grid-cols-2 gap-4 max-[650px]:grid-cols-1"><SnapshotItem icon={History} label="过去 / 当时" value={report.theme.pastPattern}/><SnapshotItem icon={Footprints} label="最近 / 新尝试" value={report.theme.recentPattern}/><SnapshotItem icon={CheckCircle2} label="有效策略" value={report.theme.effectiveStrategy}/><SnapshotItem icon={Target} label="下一步实验" value={report.theme.nextExperiment}/></div>}<div className="mt-6 border-t border-[#e7e3da] pt-5"><div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#718078]"><BookOpenCheck size={15}/>本报告引用的真实事件</div><div className="space-y-2">{report.evidence.map((item) => <div key={`${item.date}-${item.text}`} className="flex gap-3 text-xs leading-5 text-[#65736b]"><CircleDot size={12} className="mt-1 shrink-0 text-[#b76e54]"/><span><strong>{item.date}</strong> · {item.text}</span></div>)}</div></div>{report.status === "DRAFT" && <div className="mt-6 flex justify-end gap-2"><Button variant="outline">修改草稿</Button><Button>确认并保存快照</Button></div>}</article>;
}

function SnapshotItem({ icon: Icon, label, value }: { icon: typeof History; label: string; value: string | null }) {
  return <div className="rounded-2xl border border-[#e6e2da] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#6d7b74]"><Icon size={14}/>{label}</div><p className="m-0 text-sm leading-6">{value ?? "仍在积累证据"}</p></div>;
}
