import { redirect } from "next/navigation";
import { Home, Globe, CreditCard, ShoppingBag, PartyPopper, BookOpen, Send, TicketPercent } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Sidebar, NavSection } from "@/components/layout/Sidebar";

const ICON_SIZE = 16;
const ICON_STROKE = 1.75;

const sections: NavSection[] = [
  {
    title: "Hệ thống",
    items: [
      { href: "/app", label: "Trang chủ", icon: <Home size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/app/refunds", label: "Hoàn tiền", icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/app/deals", label: "Ưu đãi", icon: <TicketPercent size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/app/wallet", label: "Ví tiền", icon: <CreditCard size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/app/orders", label: "Đơn hàng", icon: <ShoppingBag size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { href: "/app/events", label: "Sự kiện", icon: <PartyPopper size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
      { href: "/app/telegram", label: "Liên kết Telegram", icon: <Send size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      { href: "/app/guide", label: "Hướng dẫn", icon: <BookOpen size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
    ],
  },
];

export default async function CustomerAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="internal-app flex h-screen overflow-hidden bg-canvas flex-col md:flex-row text-ink">
      {/* Animated background SVG — pastel theme like mockup */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#fdfdfd]">
        <svg
          className="absolute h-full w-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="bg-g1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffede6" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffede6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bg-g2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eef4ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#eef4ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bg-g3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef2f2" stopOpacity="1" />
              <stop offset="100%" stopColor="#fef2f2" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Top-right large blue/gray pastel sphere */}
          <circle cx="95%" cy="10%" r="350" fill="url(#bg-g2)">
            <animate attributeName="cx" values="95%;90%;95%" dur="20s" repeatCount="indefinite" />
            <animate attributeName="cy" values="10%;15%;10%" dur="20s" repeatCount="indefinite" />
          </circle>
          {/* Bottom-right pastel orange sphere */}
          <circle cx="85%" cy="85%" r="200" fill="url(#bg-g1)">
            <animate attributeName="cx" values="85%;80%;85%" dur="15s" repeatCount="indefinite" />
            <animate attributeName="cy" values="85%;90%;85%" dur="15s" repeatCount="indefinite" />
          </circle>
          {/* Bottom-left pastel pink sphere */}
          <circle cx="5%" cy="80%" r="250" fill="url(#bg-g3)">
            <animate attributeName="cx" values="5%;10%;5%" dur="18s" repeatCount="indefinite" />
            <animate attributeName="cy" values="80%;75%;80%" dur="18s" repeatCount="indefinite" />
          </circle>
        </svg>
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Sidebar
        brandName={session.fullName}
        brandSubtitle="Thành viên hoàn tiền"
        sections={sections}
      />
      <main className="relative z-10 flex-1 overflow-y-auto w-full">
        <div className="min-h-full p-md sm:p-xl md:p-2xl fade-in w-full max-w-[100vw]">
          {children}
        </div>
      </main>
    </div>
  );
}
