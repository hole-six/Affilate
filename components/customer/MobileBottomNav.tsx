"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, RotateCcw, Gift, Wallet, ShoppingBag } from "lucide-react";

const TABS = [
  { href: "/app", label: "Trang chủ", icon: Home },
  { href: "/app/refunds", label: "Hoàn tiền", icon: RotateCcw },
  { href: "/app/deals", label: "Ưu đãi", icon: Gift },
  { href: "/app/wallet", label: "Ví tiền", icon: Wallet },
  { href: "/app/orders", label: "Đơn hàng", icon: ShoppingBag },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/app") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex md:hidden items-stretch bg-white/95 backdrop-blur-sm border-t border-ink/5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-[3px] py-xs min-h-[58px] active:bg-ink/[0.03] transition-colors"
          >
            {active && (
              <span className="absolute top-0 h-[3px] w-8 rounded-full bg-primary" />
            )}
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 2}
              className={active ? "text-primary" : "text-mute"}
            />
            <span
              className={`text-[10px] leading-none ${
                active ? "font-bold text-primary" : "font-medium text-mute"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
