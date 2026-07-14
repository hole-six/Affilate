import { ShieldCheck, Gift, PiggyBank, Wallet, ClipboardList, Store, type LucideIcon } from "lucide-react";

const BADGES: { icon: LucideIcon; label: string; color: string }[] = [
  { icon: ShieldCheck, label: "Bảo mật dữ liệu", color: "text-positive" },
  { icon: Gift, label: "Mời bạn nhận thưởng", color: "text-primary" },
  { icon: PiggyBank, label: "Hoàn tiền tự động", color: "text-primary" },
  { icon: Wallet, label: "Rút tiền nhanh chóng", color: "text-positive" },
  { icon: ClipboardList, label: "Đối soát minh bạch", color: "text-primary" },
  { icon: Store, label: "Hỗ trợ Shopee & TikTok", color: "text-positive" },
];

function BadgeRow() {
  return (
    <>
      {BADGES.map(({ icon: Icon, label, color }) => (
        <span
          key={label}
          className="inline-flex shrink-0 items-center gap-xs rounded-full bg-canvas px-md py-xs text-[12px] font-bold text-ink ring-1 ring-ink/10"
        >
          <Icon size={14} className={color} />
          {label}
        </span>
      ))}
    </>
  );
}

export function TrustBadgesCard({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Vì sao chọn chúng tôi</div>
        <p className="mt-1 text-[16px] font-black text-ink">
          Mua hàng, <span className="text-primary">Hoàn Tiền Thật</span>
        </p>
      </div>
      <div className="mt-md overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="marquee-track flex w-max gap-sm">
          <div className="flex shrink-0 gap-sm">
            <BadgeRow />
          </div>
          <div className="flex shrink-0 gap-sm" aria-hidden="true">
            <BadgeRow />
          </div>
        </div>
      </div>
    </div>
  );
}
