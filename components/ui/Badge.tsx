type BadgeTone = "positive" | "negative" | "warning" | "neutral" | "info";

const toneClasses: Record<BadgeTone, string> = {
  positive: "bg-primary-pale text-positive-deep border border-primary-neutral/50",
  negative: "bg-negative/10 text-negative border border-negative/20",
  warning: "bg-warning/20 text-warning-deep border border-warning/30",
  neutral: "bg-canvas-soft text-body border border-canvas-soft",
  info: "bg-accent-cyan/10 text-[#0074a6] border border-accent-cyan/20",
};

const dotClasses: Record<BadgeTone, string> = {
  positive: "bg-positive",
  negative: "bg-negative",
  warning: "bg-warning-deep",
  neutral: "bg-mute",
  info: "bg-accent-cyan",
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-xs rounded-pill px-md py-[3px] text-[12px] font-semibold leading-5 border ${toneClasses[tone]}`}
    >
      {dot && (
        <span className={`h-[5px] w-[5px] shrink-0 rounded-full ${dotClasses[tone]}`} />
      )}
      {children}
    </span>
  );
}
