import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Link2,
  Package,
  Download,
  Wallet,
  BarChart3,
  MessageCircle,
  Send,
  Settings,
  Flame,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { Sidebar, NavSection } from "@/components/layout/Sidebar";

const ICON_SIZE = 16;
const ICON_STROKE = 1.75;

const sections: NavSection[] = [
  {
    title: "Vận hành",
    items: [
      { href: "/admin", label: "Tổng quan", icon: <LayoutDashboard size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/admin/customers", label: "Khách hàng", icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/admin/links", label: "Link Affiliate", icon: <Link2 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/admin/deals", label: "Deals 🔥", icon: <Flame size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
    ],
  },
  {
    title: "Đối soát & Thanh toán",
    items: [
      { href: "/admin/orders", label: "Đơn hàng", icon: <Package size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/admin/orders/import", label: "Import đối soát", icon: <Download size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/admin/payments", label: "Thanh toán", icon: <Wallet size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/admin/reports", label: "Báo cáo", icon: <BarChart3 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
    ],
  },
  {
    title: "Tích hợp",
    items: [
      { href: "/admin/zalo", label: "Zalo OA", icon: <MessageCircle size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/admin/telegram", label: "Telegram Bot", icon: <Send size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/admin/settings", label: "Cấu hình", icon: <Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return (
    <div className="internal-app flex h-screen overflow-hidden bg-canvas flex-col md:flex-row text-ink">
      {/* Animated background — admin tone (xanh nhẹ hơn) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <radialGradient id="adm-g1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9fe870" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#9fe870" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="adm-g2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38c8ff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#38c8ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="88%" cy="8%" rx="380" ry="280" fill="url(#adm-g1)">
            <animate attributeName="cx" values="88%;82%;88%" dur="16s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="8%" cy="85%" rx="320" ry="260" fill="url(#adm-g2)">
            <animate attributeName="cy" values="85%;75%;85%" dur="20s" repeatCount="indefinite" />
          </ellipse>
        </svg>
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #0e0f0c 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      <Sidebar brandName="Admin" brandSubtitle={session.fullName} sections={sections} />
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="min-h-full p-md sm:p-xl md:p-2xl fade-in w-full max-w-[100vw]">
          {children}
        </div>
      </main>
    </div>
  );
}

