import { Inbox, LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-md py-3xl text-center fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-pale text-ink-deep">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[16px] font-semibold text-ink">{title}</div>
        {description && (
          <div className="mt-xs max-w-[320px] text-[14px] text-mute leading-relaxed">{description}</div>
        )}
      </div>
      {action && <div className="mt-sm">{action}</div>}
    </div>
  );
}
