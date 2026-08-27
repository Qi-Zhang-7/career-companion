"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { BatteryCharging, CheckCircle2, Compass, Flame, Leaf, Pencil, ShieldCheck, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveCareerProfile } from "@/features/career/career-actions";
import type { CareerFormState, CareerPageData } from "@/features/career/career-types";

const initialState: CareerFormState = { status: "idle", message: "" };
const horizonLabels: Record<string, string> = {
  SHORT: "未来 1–3 个月",
  MID: "未来 3–12 个月",
  LONG: "未来 1–3 年",
};
const statusLabels: Record<string, string> = {
  EMERGING: "正在形成",
  PENDING_CONFIRMATION: "待确认",
  ACTIVE: "正在练习",
  IMPROVING: "已有变化",
  DORMANT: "暂时搁置",
};
const selfCategory: Record<string, { title: string; icon: typeof Sparkles; tone: "sage" | "warm" | "gold" | "neutral" }> = {
  strength: { title: "可能的优势", icon: Sparkles, tone: "sage" },
  stressor: { title: "容易消耗", icon: Flame, tone: "warm" },
  energy_source: { title: "能量来源", icon: BatteryCharging, tone: "gold" },
  work_style: { title: "偏好工作方式", icon: Leaf, tone: "neutral" },
};

function valueOrPlaceholder(value: string | number | null, placeholder = "还没有填写") {
  return value === null || value === "" ? placeholder : String(value);
}

function Field({ label, name, defaultValue, placeholder, type = "text", error }: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: "text" | "number";
  error?: string;
}) {
  return <label className="block">
    <span className="mb-2 block text-xs font-semibold text-[#5f6f67]">{label}</span>
    <input
      name={name}
      type={type}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-[#ddd9cf] bg-white px-3.5 text-sm text-[#304039] outline-none transition placeholder:text-[#a1aaa5] focus:border-[#7e9b8c] focus:ring-2 focus:ring-[#7e9b8c]/15"
    />
    {error && <span className="mt-1.5 block text-xs text-[#a85e48]">{error}</span>}
  </label>;
}

function CareerEditor({ data, onClose }: { data: CareerPageData; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveCareerProfile, initialState);
  const goals = useMemo(() => new Map(data.goals.map((goal) => [goal.horizon, goal])), [data.goals]);

  useEffect(() => {
    if (state.status === "success") {
      const timer = window.setTimeout(onClose, 900);
      return () => window.clearTimeout(timer);
    }
  }, [state.status, onClose]);

  const { profile } = data;

  return <div className="fixed inset-0 z-50 flex justify-end bg-[#23332d]/28 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="编辑职业档案">
    <button className="absolute inset-0 cursor-default" aria-label="关闭编辑档案" onClick={onClose}/>
    <div className="relative h-full w-full max-w-[620px] overflow-y-auto border-l border-white/70 bg-[#faf9f5] shadow-[-24px_0_70px_rgba(37,52,45,.16)]">
      <form action={action} className="min-h-full">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e6e1d7] bg-[#faf9f5]/95 px-7 py-6 backdrop-blur">
          <div><div className="eyebrow">Career Profile</div><h2 className="mb-1 mt-2 font-serif text-2xl text-[#2f4038]">编辑职业档案</h2><p className="m-0 text-sm text-[#78847e]">不需要一次填满，先记录目前确定的信息。</p></div>
          <button type="button" onClick={onClose} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-[#efede7] text-[#64736b] hover:bg-[#e5e2da]" aria-label="关闭"><X size={17}/></button>
        </header>

        <div className="space-y-7 px-7 py-7">
          <section>
            <h3 className="mb-4 text-sm font-semibold text-[#34473e]">基本信息</h3>
            <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <Field label="我希望被怎么称呼 *" name="displayName" defaultValue={profile.displayName} error={state.fieldErrors?.displayName}/>
              <Field label="当前岗位" name="currentRole" defaultValue={profile.currentRole} placeholder="例如：数据分析师" error={state.fieldErrors?.currentRole}/>
              <Field label="行业 / 业务领域" name="industry" defaultValue={profile.industry} placeholder="例如：政府数字化 / ToG" error={state.fieldErrors?.industry}/>
              <Field label="工作城市" name="city" defaultValue={profile.city} placeholder="例如：杭州" error={state.fieldErrors?.city}/>
              <Field label="工作年限" name="yearsExperience" type="number" defaultValue={profile.yearsExperience} placeholder="例如：4" error={state.fieldErrors?.yearsExperience}/>
              <Field label="职业阶段" name="careerStage" defaultValue={profile.careerStage} placeholder="例如：专业骨干 → 项目负责人" error={state.fieldErrors?.careerStage}/>
            </div>
          </section>

          <section className="border-t border-[#e7e2d8] pt-6">
            <h3 className="mb-4 text-sm font-semibold text-[#34473e]">公司与团队</h3>
            <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <Field label="公司类型" name="companyType" defaultValue={profile.companyType} placeholder="例如：数字科技公司" error={state.fieldErrors?.companyType}/>
              <Field label="公司别名" name="companyAlias" defaultValue={profile.companyAlias} placeholder="建议使用别名保护隐私" error={state.fieldErrors?.companyAlias}/>
              <Field label="团队名称" name="teamName" defaultValue={profile.teamName} placeholder="例如：政务数据产品组" error={state.fieldErrors?.teamName}/>
              <Field label="团队人数" name="teamSize" type="number" defaultValue={profile.teamSize} placeholder="可以暂时不填" error={state.fieldErrors?.teamSize}/>
              <Field label="直属领导职位" name="managerTitle" defaultValue={profile.managerTitle} placeholder="例如：部门负责人" error={state.fieldErrors?.managerTitle}/>
            </div>
          </section>

          <section className="border-t border-[#e7e2d8] pt-6">
            <h3 className="mb-1 text-sm font-semibold text-[#34473e]">职业方向</h3>
            <p className="mb-4 mt-0 text-xs leading-5 text-[#7c8881]">目标可以是一个可验证的尝试，也可以诚实地写“还不清楚”。</p>
            <div className="space-y-4">
              <Field label="未来 1–3 个月" name="goalShort" defaultValue={goals.get("SHORT")?.status === "UNCLEAR" ? "" : goals.get("SHORT")?.title} placeholder="近期希望完成或验证什么？" error={state.fieldErrors?.goalShort}/>
              <Field label="未来 3–12 个月" name="goalMid" defaultValue={goals.get("MID")?.status === "UNCLEAR" ? "" : goals.get("MID")?.title} placeholder="可以留空，表示还不清楚" error={state.fieldErrors?.goalMid}/>
              <Field label="未来 1–3 年" name="goalLong" defaultValue={goals.get("LONG")?.status === "UNCLEAR" ? "" : goals.get("LONG")?.title} placeholder="想探索怎样的职业可能？" error={state.fieldErrors?.goalLong}/>
            </div>
          </section>

          {state.message && <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${state.status === "success" ? "bg-[#e5eee9] text-[#355447]" : "bg-[#f8e9e3] text-[#9a5742]"}`}>
            {state.status === "success" && <CheckCircle2 size={16}/>} {state.message}
          </div>}
        </div>

        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e6e1d7] bg-[#faf9f5]/95 px-7 py-5 backdrop-blur">
          <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
          <Button type="submit" disabled={pending}>{pending ? "正在保存…" : "保存职业档案"}</Button>
        </footer>
      </form>
    </div>
  </div>;
}

export function CareerFeature({ data }: { data: CareerPageData }) {
  const [editing, setEditing] = useState(false);
  const { profile } = data;
  const activeGoals = ["SHORT", "MID", "LONG"].map((horizon) => ({ horizon, goal: data.goals.find((item) => item.horizon === horizon) }));

  return <div className="page-content fade-in">
    <PageHeader eyebrow="My Career" title="我的职业，不只是一份履历" subtitle="这里会随着真实经历逐渐形成对你的理解。所有判断都有依据，也都可以被你纠正。" action={<Button variant="outline" onClick={() => setEditing(true)}><Pencil size={15}/>编辑档案</Button>}/>

    <Card className="mb-6 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto] gap-6 p-7 max-[680px]:grid-cols-1">
        <div className="flex items-center gap-5">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#466a5b] text-xl font-bold text-white">{profile.displayName.slice(0, 1)}</div>
          <div><div className="mb-2 flex flex-wrap items-center gap-2"><h2 className="m-0 text-xl">{profile.displayName} · {valueOrPlaceholder(profile.currentRole, "职业角色待填写")}</h2><Badge>数据库资料</Badge></div>
            <p className="m-0 text-sm leading-6 text-[#748078]">{valueOrPlaceholder(profile.industry)} · {valueOrPlaceholder(profile.companyAlias ?? profile.companyType)}<br/>{profile.yearsExperience === null ? "工作年限待填写" : `${profile.yearsExperience} 年经验`} · {valueOrPlaceholder(profile.city)}</p>
          </div>
        </div>
        <div className="min-w-[210px] rounded-2xl bg-[#eef2ed] px-5 py-4"><div className="flex items-center justify-between gap-4 text-xs text-[#78867e]"><span>职业阶段</span><span>档案 {profile.profileCompleteness}%</span></div><div className="mt-2 font-serif text-lg text-[#3b584b]">{valueOrPlaceholder(profile.careerStage)}</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#71917f]" style={{ width: `${profile.profileCompleteness}%` }}/></div></div>
      </div>
    </Card>

    <section className="mb-6">
      <div className="mb-4 flex items-end justify-between"><div><div className="eyebrow">Career Self Model</div><h2 className="section-title mt-2">系统正在了解什么</h2></div><span className="text-xs text-[#86918b]">只展示你已确认的内容</span></div>
      {data.selfModel.length > 0 ? <div className="grid grid-cols-4 gap-4 max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1">{data.selfModel.map((item) => {
        const meta = selfCategory[item.category] ?? { title: item.category, icon: Leaf, tone: "neutral" as const };
        const Icon = meta.icon;
        return <Card className="p-5" key={item.id}><div className="mb-5 flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-[#edf1ed] text-[#466a5b]"><Icon size={17}/></span><Badge tone={meta.tone}>{item.evidenceCount} 条证据</Badge></div><div className="text-xs text-[#859089]">{meta.title}</div><h3 className="mb-0 mt-2 text-base leading-6">{item.statement}</h3></Card>;
      })}</div> : <Card className="flex items-center gap-4 border-dashed p-6"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf1ed] text-[#466a5b]"><Sparkles size={19}/></span><div><h3 className="m-0 text-sm">还在积累对你的真实理解</h3><p className="mb-0 mt-1 text-xs leading-5 text-[#78847e]">完成几次真实事件复盘并确认观察后，这里才会出现优势、压力源和工作偏好，不再用演示结论代替你。</p></div></Card>}
    </section>

    <div className="grid-2">
      <Card className="p-7"><div className="mb-5 flex items-center gap-2"><Compass size={19} className="text-[#b76e54]"/><h2 className="section-title">职业方向</h2></div><div className="space-y-4">{activeGoals.map(({ horizon, goal }, index) => <div key={horizon} className={`rounded-2xl p-4 ${index === 0 ? "bg-[#faf3ef]" : "border border-dashed border-[#d8d3c8]"}`}><div className={`text-xs font-semibold ${index === 0 ? "text-[#9a604c]" : "text-[#79847e]"}`}>{horizonLabels[horizon]}</div><p className="mb-0 mt-2 text-sm leading-6 text-[#596860]">{goal?.title ?? "还不清楚"}</p></div>)}</div></Card>

      <Card className="p-7"><div className="mb-5 flex items-center gap-2"><ShieldCheck size={19} className="text-[#466a5b]"/><h2 className="section-title">正在练习</h2></div>{data.themes.length > 0 ? <div className="space-y-3">{data.themes.map((theme, index) => <div key={theme.id} className="flex gap-4 rounded-2xl border border-[#e8e4dc] p-4"><span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-[#e5eee9] text-xs font-bold text-[#466a5b]">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{theme.title}</span><Badge tone={theme.status === "IMPROVING" ? "sage" : "gold"}>{statusLabels[theme.status] ?? theme.status}</Badge></div><p className="mb-0 mt-1 text-xs leading-5 text-[#77837c]">{theme.description ?? "继续通过真实事件积累变化证据。"}</p></div></div>)}</div> : <p className="text-sm text-[#78847e]">还没有正在练习的成长主题。</p>}</Card>
    </div>

    {editing && <CareerEditor data={data} onClose={() => setEditing(false)}/>} 
  </div>;
}
