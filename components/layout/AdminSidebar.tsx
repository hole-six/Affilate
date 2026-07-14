"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, PiggyBank } from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  emoji?: string;
  icon: React.ReactNode;
  badge?: number;
};

export type AdminNavSection = {
  title?: string;
  items: AdminNavItem[];
};

export function AdminSidebar({
  adminName,
  sections,
}: {
  adminName: string;
  sections: AdminNavSection[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-ink-deep px-md py-sm sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-xs">
          <img src="/09_admin.png" alt="Ví Heo Admin" className="h-9 w-9 object-contain" />
          <div className="font-bold text-[14px] text-white truncate max-w-[200px]">Ví Heo Admin</div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 flex-col justify-between bg-gradient-to-b from-ink to-ink-deep shadow-xl md:shadow-none transition-transform duration-300 md:relative md:translate-x-0 flex ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="px-xl pt-xl pb-lg border-b border-white/10 mb-md relative">
            <button
              className="absolute top-4 right-4 p-1 text-white/50 hover:text-white md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-sm pr-6">
              <img src="/09_admin.png" alt="Ví Heo Admin" className="h-10 w-10 shrink-0 object-contain drop-shadow" />
              <div className="min-w-0">
                <div className="truncate text-[15px] font-black text-white leading-tight">Ví Heo Admin</div>
                <div className="truncate text-[12px] font-medium text-white/40 leading-tight mt-[2px]">
                  {adminName}
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-sm px-md pb-lg">
            {sections.map((section, i) => (
              <div key={i} className={i > 0 ? "mt-md" : ""}>
                {section.title && (
                  <div className="mb-sm px-md py-xs text-[11px] font-bold uppercase tracking-wider text-white/30">
                    {section.title}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center gap-md rounded-xl px-md py-[10px] text-[14px] font-bold transition-all duration-150 ${
                          active
                            ? "bg-primary text-white shadow-md shadow-primary/30"
                            : "text-white/60 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <span
                          className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                            active ? "text-white" : "text-white/50"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {!!item.badge && item.badge > 0 && (
                          <span
                            className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                              active ? "bg-white/25 text-white" : "bg-primary text-white"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer: mascot card + logout */}
        <div className="px-md py-lg border-t border-white/10">
          <div className="mb-md flex items-center gap-sm rounded-2xl bg-white/5 p-md">
            <img src="/09_admin.png" alt="" className="h-10 w-10 shrink-0 object-contain" />
            <div className="min-w-0">
              <div className="truncate text-[12px] font-bold text-white">Ví Heo</div>
              <div className="truncate text-[11px] text-white/40 leading-tight">
                Tiết kiệm hôm nay, vững vàng ngày mai
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-md rounded-xl px-md py-[10px] text-left text-[14px] font-bold text-negative transition-all duration-150 hover:bg-negative/10 group"
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              className="shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5"
            />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
