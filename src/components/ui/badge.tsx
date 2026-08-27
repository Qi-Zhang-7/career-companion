import { cn } from "@/lib/utils";

export function Badge({ children, tone = "sage", className }: { children: React.ReactNode; tone?: "sage" | "warm" | "gold" | "neutral"; className?: string }) {
  const tones = { sage: "bg-[#e5eee9] text-[#466a5b]", warm: "bg-[#f5e7e0] text-[#9d5943]", gold: "bg-[#f5ecd7] text-[#8b6a2f]", neutral: "bg-[#efede7] text-[#66736d]" };
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}
