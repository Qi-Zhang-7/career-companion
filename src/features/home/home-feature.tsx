import Link from "next/link";
import { ArrowRight, Brain, ChevronRight, MessageCircleHeart, RotateCcw, Sparkles, Target, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const actions = [
  { title: "我想聊聊", description: "不急着解决，先把心里的事说出来", icon: MessageCircleHeart, href: "/chat?mode=listen", tone: "#e5eee9" },
  { title: "遇到一个问题", description: "一起看清事实、目标和可控的部分", icon: Brain, href: "/chat?mode=clarify", tone: "#f5ecd7" },
  { title: "陪我练一下", description: "在真实沟通前，先安全地练一遍", icon: Sparkles, href: "/roleplay", tone: "#f5e7e0" },
  { title: "帮我复盘", description: "看看发生了什么，下次可以怎样不同", icon: RotateCcw, href: "/reflection", tone: "#e9e8f1" },
];

type HomeFeatureProps = {
  userName: string;
};

export function HomeFeature({ userName }: HomeFeatureProps) {
  return <div className="page-content fade-in">
    <header className="mb-9 flex items-start justify-between gap-6">
      <div><div className="eyebrow">星期三 · 8 月 26 日</div><h1 className="page-title">今天工作怎么样，{userName}？</h1><p className="page-subtitle">无论是一个具体难题，还是说不太清的累，都可以从这里开始。</p></div>
      <div className="hidden items-center gap-3 rounded-full border border-white bg-white/55 px-4 py-2 text-xs text-[#65756d] shadow-sm md:flex"><span className="size-2 rounded-full bg-[#6d957f]"/>你的空间 · 仅自己可见</div>
    </header>

    <section className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
      {actions.map(({ title, description, icon: Icon, href, tone }) => <Link key={title} href={href} className="group no-underline text-inherit"><Card className="h-full min-h-[190px] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#bcc9c1] hover:shadow-[0_20px_50px_rgba(54,72,63,.1)]"><div className="mb-8 grid size-11 place-items-center rounded-2xl text-[#41594e]" style={{ background: tone }}><Icon size={21}/></div><h2 className="mb-2 text-lg font-semibold">{title}</h2><p className="m-0 text-sm leading-6 text-[#748078]">{description}</p><ArrowRight className="mt-5 text-[#7f9187] transition group-hover:translate-x-1" size={17}/></Card></Link>)}
    </section>

    <section className="mt-7 grid grid-cols-[1.35fr_.65fr] gap-5 max-[860px]:grid-cols-1">
      <Card className="overflow-hidden p-7">
        <div className="mb-5 flex items-center justify-between"><div><div className="eyebrow">上次我们聊到</div><h2 className="section-title mt-2">一个想带进现实的尝试</h2></div><Target size={22} className="text-[#b76e54]"/></div>
        <blockquote className="m-0 rounded-2xl border-l-4 border-[#b76e54] bg-[#faf3ef] px-5 py-4 font-serif text-[18px] leading-8 text-[#4b4945]">“下次被催时，先确认优先级，而不是马上答应。”</blockquote>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-[#748078]">关联成长主题 · 建立责任边界</span><div className="flex gap-2"><Button asChild variant="outline" size="sm"><Link href="/reflection">我试过了</Link></Button><Button asChild size="sm"><Link href="/roleplay">再练一遍 <ChevronRight size={15}/></Link></Button></div></div>
      </Card>
      <Card className="p-7">
        <div className="mb-5 flex items-center gap-2"><UsersRound size={18} className="text-[#466a5b]"/><h2 className="section-title">最近你比较关注</h2></div>
        <div className="flex flex-wrap gap-2.5">{["#项目压力", "#张经理", "#责任边界", "#职业方向"].map((tag, i) => <Badge key={tag} tone={i === 1 ? "warm" : i === 3 ? "gold" : "sage"} className="px-3.5 py-2">{tag}</Badge>)}</div>
        <Link href="/growth" className="mt-7 flex items-center justify-between border-t border-[#e8e4da] pt-4 text-sm font-semibold text-[#466a5b] no-underline">看看这些主题的变化 <ChevronRight size={16}/></Link>
      </Card>
    </section>

    <Card className="mt-5 flex items-center justify-between gap-5 p-6 max-[650px]:items-start max-[650px]:flex-col"><div><div className="mb-1 text-sm font-semibold">30 秒工作记录</div><p className="m-0 text-sm text-[#748078]">今天最消耗你的，和最有成就感的，分别是什么？</p></div><Button variant="secondary">记一下今天</Button></Card>
  </div>;
}
