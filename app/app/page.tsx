import { redirect } from "next/navigation";
import {
  PiggyBank,
  Clock,
  Wallet,
  Package,
  Percent,
  ClipboardList,
  Target,
  ArrowUpRight,
  Sparkles,
  Link2,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { CopyInviteButton } from "@/components/customer/CopyInviteButton";
import { ProgressTabs } from "@/components/customer/ProgressTabs";

export default async function CustomerHomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin" || !session.customerId) redirect("/admin");

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 5 },
      trackingLinks: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const allOrders = customer?.orders ?? [];
  const totalIncome = allOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const pendingIncome = allOrders
    .filter((o) => o.orderStatus === "pending")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const availableBalance = allOrders
    .filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  const activity = [
    ...(customer?.trackingLinks.map((l) => ({
      id: l.id,
      time: l.createdAt,
      text: `Tạo link ${l.shortCode ?? l.trackingCode}`,
      type: "link" as const,
    })) ?? []),
    ...(customer?.orders.map((o) => ({
      id: o.id,
      time: o.createdAt,
      text: `Đơn hàng ${o.orderExternalId}`,
      amount: formatCurrency(o.customerRewardAmount),
      type: "order" as const,
    })) ?? []),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 8);

  const firstName = (customer?.fullName ?? session.fullName).split(" ").at(-1) ?? "bạn";

  return (
    <div className="flex flex-col gap-xl fade-in">
      {/* ═══ HERO BANNER ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e0f0c] via-[#163300] to-[#1a4a00] p-2xl">
        {/* Animated SVG blobs */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9fe870" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#9fe870" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38c8ff" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#38c8ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="85%" cy="20%" r="180" fill="url(#g1)">
            <animate attributeName="cx" values="85%;80%;85%" dur="8s" repeatCount="indefinite" />
            <animate attributeName="cy" values="20%;35%;20%" dur="8s" repeatCount="indefinite" />
          </circle>
          <circle cx="10%" cy="80%" r="140" fill="url(#g2)">
            <animate attributeName="cx" values="10%;18%;10%" dur="10s" repeatCount="indefinite" />
            <animate attributeName="cy" values="80%;65%;80%" dur="10s" repeatCount="indefinite" />
          </circle>
          <circle cx="60%" cy="90%" r="100" fill="url(#g1)">
            <animate attributeName="r" values="100;130;100" dur="7s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Floating dots pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-20"
          style={{backgroundImage:"radial-gradient(circle, #9fe870 1px, transparent 1px)", backgroundSize:"28px 28px"}}
        />

        <div className="relative z-10 flex items-start justify-between gap-lg flex-wrap">
          <div>
            <div className="flex items-center gap-sm mb-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                <Sparkles size={12} strokeWidth={1.75} className="text-primary" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary/60">
                Chào mừng trở lại
              </span>
            </div>
            <h1 className="text-[30px] font-black leading-tight text-white">
              Xin chào, <span className="text-primary">{firstName}</span>! 👋
            </h1>
            <p className="mt-xs text-[13px] text-white/50 leading-relaxed">
              {allOrders.length === 0
                ? "Chưa có đơn nào — chia sẻ link để bắt đầu hoàn tiền!"
                : `Bạn có ${allOrders.length} đơn đã ghi nhận. Tiếp tục mua sắm nhé!`}
            </p>
          </div>

          <div className="flex gap-sm flex-wrap">
            <CopyInviteButton customerCode={customer?.customerCode ?? ""} />
            <a href="/app/refunds">
              <button className="flex items-center gap-xs rounded-xl bg-primary px-xl py-[10px] text-[13px] font-bold text-ink-deep transition-all duration-150 hover:bg-primary-active hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]">
                <Percent size={14} strokeWidth={2} />
                Hoàn tiền ngay
                <ArrowUpRight size={13} strokeWidth={2} />
              </button>
            </a>
          </div>
        </div>

        {/* Stats row inside banner */}
        <div className="relative z-10 mt-xl grid grid-cols-1 sm:grid-cols-3 gap-md pt-xl border-t border-white/10">
          {[
            { label: "Tổng tích luỹ", value: formatCurrency(totalIncome), icon: TrendingUp },
            { label: "Đang xử lý", value: formatCurrency(pendingIncome), icon: Clock },
            { label: "Số dư rút", value: formatCurrency(availableBalance), icon: Wallet },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8">
                <Icon size={14} strokeWidth={1.75} className="text-primary" />
              </div>
              <div>
                <div className="text-[11px] text-white/40 leading-none">{label}</div>
                <div className="text-[15px] font-bold text-white tabular-nums leading-tight mt-[2px]">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 gap-md lg:grid-cols-4">
        {[
          { icon: PiggyBank, label: "Tổng thu nhập", value: formatCurrency(totalIncome), tag: "Tích luỹ", color: "from-emerald-400/20 to-green-300/10", iconBg: "bg-emerald-50 text-emerald-600" },
          { icon: Clock, label: "Chờ xác nhận", value: formatCurrency(pendingIncome), tag: "Đang xử lý", color: "from-amber-400/20 to-yellow-300/10", iconBg: "bg-amber-50 text-amber-600" },
          { icon: Wallet, label: "Số dư khả dụng", value: formatCurrency(availableBalance), tag: "Rút được", color: "from-sky-400/20 to-blue-300/10", iconBg: "bg-sky-50 text-sky-600" },
          { icon: Package, label: "Tổng đơn hàng", value: String(allOrders.length), tag: "Đơn hàng", color: "from-violet-400/20 to-purple-300/10", iconBg: "bg-violet-50 text-violet-600" },
        ].map(({ icon: Icon, label, value, tag, color, iconBg }) => (
          <div
            key={label}
            className={`group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
          >
            {/* gradient tint */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60`} />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} transition-transform duration-150 group-hover:scale-110`}>
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <span className="rounded-pill bg-black/5 px-sm py-[3px] text-[10px] font-semibold text-black/40">{tag}</span>
              </div>
              <div className="mt-lg">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-black/40">{label}</div>
                <div className="mt-xs text-[22px] font-bold text-gray-900 tabular-nums leading-tight">{value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ BOTTOM PANELS ═══ */}
      <div className="grid grid-cols-1 gap-lg lg:grid-cols-[2fr_1fr]">
        {/* Activity feed */}
        <div className="rounded-2xl bg-white p-xl shadow-sm ring-1 ring-black/5">
          <h2 className="mb-lg flex items-center gap-sm text-[15px] font-bold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#9fe870] to-[#7dd654] text-ink-deep shadow-sm">
              <ClipboardList size={15} strokeWidth={2} />
            </span>
            Nhật ký hoạt động
          </h2>

          {activity.length === 0 ? (
            <div className="flex flex-col items-center py-2xl text-center">
              <div className="mb-lg relative">
                {/* Animated empty state illustration */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 mx-auto">
                  <ShoppingBag size={28} strokeWidth={1.5} className="text-gray-300" />
                </div>
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-ink-deep">
                  0
                </div>
              </div>
              <div className="text-[14px] font-semibold text-gray-700">Chưa có hoạt động nào</div>
              <div className="mt-xs text-[12px] text-gray-400">Chia sẻ link để bắt đầu kiếm tiền hoàn!</div>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-50">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-sm gap-sm group hover:bg-gray-50/60 rounded-lg px-xs transition-colors">
                  <div className="flex items-center gap-sm min-w-0">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      a.type === "order" ? "bg-emerald-50" : "bg-sky-50"
                    }`}>
                      {a.type === "order"
                        ? <ShoppingBag size={13} strokeWidth={1.75} className="text-emerald-500" />
                        : <Link2 size={13} strokeWidth={1.75} className="text-sky-500" />
                      }
                    </div>
                    <span className="truncate text-[13px] text-gray-600">{a.text}</span>
                  </div>
                  <div className="flex items-center gap-sm shrink-0">
                    {"amount" in a && a.amount && (
                      <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-sm py-[2px] rounded-pill">{a.amount}</span>
                    )}
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">{formatDate(a.time)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Progress card */}
        <div className="rounded-2xl bg-white p-xl shadow-sm ring-1 ring-black/5">
          <h2 className="mb-lg flex items-center gap-sm text-[15px] font-bold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#9fe870] to-[#7dd654] text-ink-deep shadow-sm">
              <Target size={15} strokeWidth={2} />
            </span>
            Tiến độ của bạn
          </h2>
          <ProgressTabs hasShoppingActivity={allOrders.length > 0} />
        </div>
      </div>
    </div>
  );
}
