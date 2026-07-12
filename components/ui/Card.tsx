import { HTMLAttributes } from "react";

type Variant = "default" | "soft" | "tinted" | "dark";

const variantClasses: Record<Variant, string> = {
  default: "bg-white text-gray-900 shadow-sm ring-1 ring-black/5",
  soft: "bg-gray-50 text-gray-900 ring-1 ring-black/[0.03]",
  tinted: "bg-gradient-to-br from-[#9fe870]/20 to-[#7dd654]/10 text-ink-deep ring-1 ring-[#9fe870]/30",
  dark: "bg-gradient-to-br from-[#0e0f0c] to-[#163300] text-white shadow-md",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  hover?: boolean;
}

export function Card({ variant = "default", hover = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-xl ${variantClasses[variant]} ${
        hover ? "transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer" : ""
      } ${className}`}
      {...props}
    />
  );
}
