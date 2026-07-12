import { LucideIcon } from "lucide-react";

const toneConfig = {
  default: {
    iconBg: "bg-slate-100 text-slate-600",
    gradient: "from-slate-50/80 to-white",
    accent: "#64748b",
  },
  positive: {
    iconBg: "bg-emerald-50 text-emerald-600",
    gradient: "from-emerald-50/60 to-white",
    accent: "#10b981",
  },
  warning: {
    iconBg: "bg-amber-50 text-amber-600",
    gradient: "from-amber-50/60 to-white",
    accent: "#f59e0b",
  },
  negative: {
    iconBg: "bg-red-50 text-red-600",
    gradient: "from-red-50/60 to-white",
    accent: "#ef4444",
  },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tag,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tag?: string;
  tone?: "default" | "positive" | "warning" | "negative";
}) {
  const cfg = toneConfig[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.gradient} p-lg shadow-sm ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/8`}
    >
      {/* Top accent line animated on hover */}
      <div
        className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.iconBg} transition-transform duration-150 group-hover:scale-110`}
        >
          <Icon size={18} strokeWidth={1.75} />
        </div>
        {tag && (
          <span className="rounded-pill bg-black/5 px-sm py-[3px] text-[10px] font-semibold text-black/35">
            {tag}
          </span>
        )}
      </div>

      <div className="mt-lg">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-black/35">{label}</div>
        <div className="mt-xs text-[22px] font-bold text-gray-900 tabular-nums leading-tight">
          {value}
        </div>
      </div>

      {/* Bottom-right decorative circle */}
      <div
        className="pointer-events-none absolute -right-4 -bottom-4 h-16 w-16 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-125"
        style={{ background: cfg.accent }}
      />
    </div>
  );
}
