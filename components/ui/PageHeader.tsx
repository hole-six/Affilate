export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-lg fade-in">
      <div>
        <h1 className="text-[24px] font-black tracking-tight text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[14px] text-gray-500 font-medium">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-sm shrink-0">{action}</div>}
    </div>
  );
}
