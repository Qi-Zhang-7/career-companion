import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#466a5b]/35 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-[#466a5b] text-white shadow-[0_8px_24px_rgba(70,106,91,.22)] hover:bg-[#39594c] hover:-translate-y-0.5",
        secondary: "bg-[#e5eee9] text-[#355447] hover:bg-[#d9e7df]",
        outline: "border border-[#dedad0] bg-white/75 text-[#37463f] hover:border-[#9bafa5] hover:bg-white",
        ghost: "text-[#627169] hover:bg-[#eeece6]",
        warm: "bg-[#b76e54] text-white shadow-[0_8px_24px_rgba(183,110,84,.2)] hover:bg-[#a45f48]",
      },
      size: { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-sm", lg: "h-13 px-7 text-[15px]" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
