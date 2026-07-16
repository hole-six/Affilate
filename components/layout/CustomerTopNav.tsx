"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TicketPercent, Store, ShoppingBag, Info, LogOut } from "lucide-react";

export function CustomerTopNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/app", label: "Trang chủ", icon: <Home size={18} /> },
    { href: "/app/deals", label: "Ưu đãi", icon: <TicketPercent size={18} /> },
    { href: "/cua-hang", label: "Cửa hàng", icon: <Store size={18} /> },
    { href: "/app/orders", label: "Đơn hàng", icon: <ShoppingBag size={18} /> },
    { href: "/huong-dan", label: "Giới thiệu", icon: <Info size={18} /> },
  ];

  return (
    <header className="bg-white border-b border-primary-pale/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-lg md:px-xl h-[72px] flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/app" className="flex items-center gap-sm hover:opacity-90 transition-opacity">
          <img src="/icontitle.png" alt="Logo" className="h-11 w-11 object-contain rounded-full shadow-sm border-2 border-white" />
          <div className="flex flex-col">
            <span className="text-[18px] font-black text-primary leading-tight">iviback</span>
            <span className="text-[12px] font-bold text-mute leading-none">Hoàn tiền là thích! 💗</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-xs">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-[6px] px-md py-[10px] rounded-2xl text-[14px] font-bold transition-all ${
                  active
                    ? "bg-primary-pale/30 text-primary"
                    : "text-mute hover:bg-canvas-soft hover:text-ink"
                }`}
              >
                {l.icon}
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-md">
          <div className="hidden sm:flex items-center gap-sm bg-canvas-soft border border-primary-pale/50 pl-1 pr-3 py-1 rounded-full cursor-pointer hover:bg-primary-pale/20 transition-colors">
            <img src="/icontitle.png" alt="" className="h-8 w-8 rounded-full object-contain shadow-sm" />
            <span className="text-[14px] font-bold text-ink truncate max-w-[120px]">{userName}</span>
          </div>
          <Link href="/api/auth/logout" className="p-2 text-mute hover:text-negative bg-canvas-soft rounded-full hover:bg-negative/10 transition-colors" title="Đăng xuất">
            <LogOut size={18} />
          </Link>
        </div>
      </div>

      {/* Mobile nav bottom bar could be added here later if needed */}
    </header>
  );
}
