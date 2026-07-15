"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sun, Menu, X } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  pigIcon?: string; // path to pig image in /public
  badge?: number;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export function Sidebar({
  brandName,
  brandSubtitle,
  sections,
}: {
  brandName: string;
  brandSubtitle: string;
  sections: NavSection[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin" || href === "/app") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const initials = brandName
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-canvas border-b border-ink/5 px-md py-sm sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-xs">
          <img src="/anhlogo.png" alt="Logo" className="h-8 w-auto object-contain" />
          <div className="font-bold text-[14px] text-ink truncate max-w-[200px]">{brandName}</div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-xs text-mute hover:text-ink hover:bg-ink/5 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 flex-col justify-between bg-canvas border-r border-ink/5 shadow-xl md:shadow-none transition-transform duration-300 md:relative md:translate-x-0 flex ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="relative flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="px-xl pt-xl pb-lg border-b border-ink/5 mb-md relative">
            <button 
              className="absolute top-4 right-4 p-1 text-mute hover:text-ink md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-sm pr-6">
              {/* Avatar */}
              <div className="relative flex shrink-0 items-center justify-center">
                <img src="/anhlogo.png" alt="Logo" className="h-11 w-auto object-contain drop-shadow-sm" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#2bc48a] border-2 border-white translate-x-1 translate-y-1" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14px] font-bold text-ink leading-tight">{brandName}</div>
                <div className="truncate text-[12px] font-medium text-mute leading-tight mt-[2px]">{brandSubtitle}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-sm px-md pb-lg">
            {sections.map((section, i) => (
              <div key={i} className={i > 0 ? "mt-md" : ""}>
                {section.title && (
                  <div className="mb-sm px-md py-xs text-[11px] font-bold uppercase tracking-wider text-mute">
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
                            ? "bg-primary-pale text-ink-deep"
                            : "text-mute hover:bg-ink/5 hover:text-ink"
                        }`}
                      >
                        <span className={`shrink-0 transition-transform duration-150 group-hover:scale-110`}>
                          {item.pigIcon ? (
                            <img
                              src={item.pigIcon}
                              alt=""
                              className={`h-6 w-6 object-contain transition-transform duration-150 group-hover:scale-110 ${active ? "" : "opacity-70"}`}
                            />
                          ) : (
                            <span className={active ? "text-primary" : "text-mute"}>
                              {item.icon}
                            </span>
                          )}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {!!item.badge && item.badge > 0 && (
                          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-negative px-1 text-[11px] font-bold text-white">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                        {!item.badge && active && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer items */}
        <div className="px-md py-lg border-t border-ink/5 bg-canvas">
          <div className="flex w-full items-center justify-between rounded-xl px-md py-[10px] text-[13px] font-bold text-mute mb-xs">
            <div className="flex items-center gap-md">
              <Sun size={18} strokeWidth={2.5} className="text-accent-orange" />
              <span>Giao diện</span>
            </div>
            <span className="text-[12px] opacity-80">Sáng</span>
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
