"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, CalendarHeart, ChartNoAxesCombined, CircleUserRound, Compass, MessageCircleHeart, Settings, Sparkles, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "今天", icon: CalendarHeart },
  { href: "/chat", label: "陪伴", icon: MessageCircleHeart },
  { href: "/roleplay", label: "练习", icon: Sparkles },
  { href: "/career", label: "我的职业", icon: BriefcaseBusiness },
  { href: "/people", label: "职场关系", icon: UsersRound },
  { href: "/reflection", label: "复盘", icon: Compass },
  { href: "/growth", label: "成长", icon: ChartNoAxesCombined },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 w-[246px] border-r border-[#e1ddd3] bg-[#f8f6f0]/94 px-4 py-6 backdrop-blur-xl max-[980px]:hidden">
        <Link href="/" className="mb-8 flex items-center gap-3 px-3 no-underline text-[#283b33]">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#466a5b] text-white"><CircleUserRound size={21}/></span>
          <span><strong className="block font-serif text-[17px] font-semibold">Career Companion</strong><small className="text-[#7b8881]">你的职场成长空间</small></span>
        </Link>
        <nav className="space-y-1.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <Link key={href} href={href} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium no-underline transition", active ? "bg-white text-[#355447] shadow-sm" : "text-[#69766f] hover:bg-white/65 hover:text-[#35443d]")}><Icon size={18}/>{label}</Link>;
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-5">
          <Link href="/settings" className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm no-underline", pathname.startsWith("/settings") ? "bg-white text-[#355447]" : "text-[#69766f] hover:bg-white/65")}><Settings size={18}/>记忆与隐私</Link>
          <div className="mt-4 rounded-2xl bg-[#e9eee9] p-4 text-xs leading-5 text-[#607169]"><div className="mb-1 flex items-center gap-2 font-semibold text-[#405c50]"><Sparkles size={14}/>长期陪伴已开启</div>你可以随时查看或管理被记住的信息。</div>
        </div>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 hidden h-16 border-t border-[#dedad1] bg-[#faf8f3]/95 px-2 backdrop-blur-xl max-[980px]:flex">
        {links.slice(0, 5).map(({ href, label, icon: Icon }) => { const active = href === "/" ? pathname === "/" : pathname.startsWith(href); return <Link key={href} href={href} className={cn("flex flex-1 flex-col items-center justify-center gap-1 text-[10px] no-underline", active ? "text-[#466a5b]" : "text-[#829087]")}><Icon size={19}/>{label}</Link>; })}
      </nav>
    </>
  );
}
