import {
  Users,
  Link2,
  Package,
  CircleDollarSign,
  Gift,
  CircleCheck,
  TriangleAlert,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [
    totalCustomers,
    totalLinks,
    totalOrders,
    commissionAgg,
    rewardAgg,
    profitAgg,
    paidAgg,
    unmappedOrders,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.trackingLink.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { commissionAmount: true } }),
    prisma.order.aggregate({ _sum: { customerRewardAmount: true }, where: { payoutStatus: { not: "paid" } } }),
    prisma.order.aggregate({ _sum: { systemProfitAmount: true } }),
    prisma.order.aggregate({ _sum: { customerRewardAmount: true }, where: { payoutStatus: "paid" } }),
    prisma.order.count({ where: { OR: [{ customerId: null }, { trackingLinkId: null }] } }),
  ]);

  const commission = Number(commissionAgg._sum.commissionAmount ?? 0);
  const profit = Number(profitAgg._sum.systemProfitAmount ?? 0);
  const debt = Number(rewardAgg._sum.customerRewardAmount ?? 0);
  const paid = Number(paidAgg._sum.customerRewardAmount ?? 0);

  return (
    <div className="flex flex-col gap-lg fade-in">

      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-hidden rounded-3xl p-xl sm:p-2xl"
        style={{ background: "linear-gradient(135deg, #fff3ee 0%, #fde8d8 50%, #ffecd2 100%)" }}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#ffcba4] opacity-30" />
        <div className="pointer-events-none absolute -bottom-6 right-32 h-24 w-24 rounded-full bg-[#ffa07a] opacity-20" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#ffe0cc] opacity-40" />

        <div className="relative z-10 flex items-center justify-between gap-lg flex-wrap">
          <div className="flex items-center gap-lg">
            <img
              src="/heodashboard.png"
              alt="Tổng quan"
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-lg shrink-0"
            />
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#e86a33]/60 mb-1">
                Bảng điều khiển
              </p>
              <h1 className="text-[26px] sm:text-[32px] font-black leading-tight text-[#2d1f14]">
                Tổng quan hệ thống
              </h1>
              <p className="mt-1 text-[13px] text-[#a0816a] leading-relaxed">
                Hiệu suất affiliate và số dư công nợ toàn hệ thống.
              </p>
            </div>
          </div>
          <div className="flex gap-sm flex-wrap items-center">
            <a href="/admin/orders/import">
              <button className="flex items-center gap-xs rounded-2xl bg-white/80 border border-[#e86a33]/20 px-xl py-[10px] text-[13px] font-bold text-[#e86a33] shadow-sm transition-all hover:bg-white hover:shadow-md active:scale-[0.97]">
                Import đối soát
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </button>
            </a>
            <a href="/admin/payments">
              <button className="flex items-center gap-xs rounded-2xl bg-[#e86a33] px-xl py-[10px] text-[13px] font-bold text-white shadow-md shadow-[#e86a33]/30 transition-all hover:bg-[#d65d2a] hover:shadow-lg active:scale-[0.97]">
                Thanh toán
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* ═══ 4 KPI CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Khách hàng */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-sky-50 opacity-60" />
          <div className="relative">
            <div className="flex items-start justify-between mb-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 transition-transform group-hover:scale-110">
                <img src="/heochaomung.png" alt="" className="h-7 w-7 object-contain" />
              </div>
              <span className="rounded-full bg-blue-100 px-sm py-[3px] text-[10px] font-bold text-blue-600">Thành viên</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Khách hàng</div>
            <div className="text-[28px] font-black text-gray-900 tabular-nums leading-tight">{totalCustomers}</div>
            <div className="mt-1 text-[11px] text-gray-400">người dùng đã đăng ký</div>
          </div>
        </div>

        {/* Link Affiliate */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-50 opacity-60" />
          <div className="relative">
            <div className="flex items-start justify-between mb-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 transition-transform group-hover:scale-110">
                <img src="/heogiamgia.png" alt="" className="h-7 w-7 object-contain" />
              </div>
              <span className="rounded-full bg-violet-100 px-sm py-[3px] text-[10px] font-bold text-violet-600">Affiliate</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Link Affiliate</div>
            <div className="text-[28px] font-black text-gray-900 tabular-nums leading-tight">{totalLinks}</div>
            <div className="mt-1 text-[11px] text-gray-400">link đang hoạt động</div>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-60" />
          <div className="relative">
            <div className="flex items-start justify-between mb-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 transition-transform group-hover:scale-110">
                <img src="/heoqua.png" alt="" className="h-7 w-7 object-contain" />
              </div>
              <span className="rounded-full bg-amber-100 px-sm py-[3px] text-[10px] font-bold text-amber-600">Đơn hàng</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Tổng đơn</div>
            <div className="text-[28px] font-black text-gray-900 tabular-nums leading-tight">{totalOrders}</div>
            <div className="mt-1 text-[11px] text-gray-400">đơn hàng đã ghi nhận</div>
          </div>
        </div>

        {/* Đã hoàn tiền */}
        <div className="group relative overflow-hidden rounded-2xl p-lg shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #f1fdf2 100%)", outline: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="relative">
            <div className="flex items-start justify-between mb-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 transition-transform group-hover:scale-110">
                <img src="/heovitien.png" alt="" className="h-7 w-7 object-contain" />
              </div>
              <span className="rounded-full bg-emerald-100 px-sm py-[3px] text-[10px] font-bold text-emerald-600">Đã hoàn</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Đã hoàn tiền</div>
            <div className="text-[22px] font-black text-gray-900 tabular-nums leading-tight">{formatCurrency(paid)}</div>
            <div className="mt-1 text-[11px] text-gray-400">đã chuyển khoản thành công</div>
          </div>
        </div>
      </div>

      {/* ═══ DOANH THU + VẬN HÀNH ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">

        {/* Cột trái: TÀI CHÍNH */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden p-xl"
              style={{ background: "linear-gradient(135deg, #fff3ee 0%, #fde8d8 100%)" }}>
              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#e86a33] opacity-10" />
              <div className="relative z-10 flex items-center gap-sm mb-xl">
                <img src="/heongansach.png" alt="" className="h-10 w-10 object-contain" />
                <div>
                  <h2 className="text-[16px] font-bold text-gray-900">Doanh thu & Lợi nhuận</h2>
                  <p className="text-[12px] text-gray-400">Tổng hợp tài chính toàn hệ thống</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                <div>
                  <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Tổng hoa hồng nhận về
                  </div>
                  <div className="flex items-end gap-sm">
                    <div className="text-[36px] font-black tracking-tight text-gray-900 leading-none">
                      {formatCurrency(commission)}
                    </div>
                    <TrendingUp size={18} className="text-emerald-500 mb-1" />
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Hệ thống thực giữ
                  </div>
                  <div className="flex items-end gap-sm">
                    <div className="text-[36px] font-black tracking-tight text-[#e86a33] leading-none">
                      {formatCurrency(profit)}
                    </div>
                    <CircleDollarSign size={18} className="text-[#e86a33] mb-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <div className="p-xl">
                <div className="flex items-center gap-sm mb-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
                    <Gift size={16} className="text-rose-500" />
                  </div>
                  <span className="text-[14px] font-bold text-gray-900">Công nợ khách hàng</span>
                </div>
                <div className="text-[26px] font-black text-gray-900 tabular-nums">{formatCurrency(debt)}</div>
                <p className="text-[12px] text-gray-400 mt-1">Cần hoàn trả cho khách hàng</p>
                <a href="/admin/payments" className="mt-md inline-flex items-center gap-xs text-[12px] font-bold text-[#e86a33] hover:text-[#d65d2a] transition-colors">
                  Xem chi tiết <ArrowUpRight size={12} strokeWidth={2.5} />
                </a>
              </div>
              <div className="p-xl">
                <div className="flex items-center gap-sm mb-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                    <CircleCheck size={16} className="text-emerald-500" />
                  </div>
                  <span className="text-[14px] font-bold text-gray-900">Đã thanh toán</span>
                </div>
                <div className="text-[26px] font-black text-gray-900 tabular-nums">{formatCurrency(paid)}</div>
                <p className="text-[12px] text-gray-400 mt-1">Đã chuyển khoản thành công</p>
                <a href="/admin/reports" className="mt-md inline-flex items-center gap-xs text-[12px] font-bold text-[#e86a33] hover:text-[#d65d2a] transition-colors">
                  Xem báo cáo <ArrowUpRight size={12} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: VẬN HÀNH */}
        <div className="flex flex-col gap-lg">
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] p-xl flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-sm">
              <img src="/heodashboard.png" alt="" className="h-9 w-9 object-contain" />
              <h2 className="text-[15px] font-bold text-gray-900">Chỉ số vận hành</h2>
            </div>

            {[
              { href: "/admin/customers", icon: Users, label: "Khách hàng", value: totalCustomers, bg: "bg-blue-50", color: "text-blue-500" },
              { href: "/admin/links", icon: Link2, label: "Link Affiliate", value: totalLinks, bg: "bg-violet-50", color: "text-violet-500" },
              { href: "/admin/orders", icon: Package, label: "Đơn hàng", value: totalOrders, bg: "bg-amber-50", color: "text-amber-500" },
            ].map(({ href, icon: Icon, label, value, bg, color }) => (
              <a key={label} href={href}
                className="group flex items-center justify-between rounded-2xl bg-gray-50/80 border border-gray-100 p-lg hover:bg-orange-50/50 hover:border-[#e86a33]/20 transition-all">
                <div className="flex items-center gap-md">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} transition-transform group-hover:scale-110`}>
                    <Icon size={18} className={color} strokeWidth={1.75} />
                  </div>
                  <span className="text-[14px] font-semibold text-gray-800">{label}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="text-[20px] font-black text-gray-900 tabular-nums">{value}</span>
                  <ChevronRightIcon />
                </div>
              </a>
            ))}

            {unmappedOrders > 0 && (
              <a href="/admin/orders" className="group flex items-center justify-between rounded-2xl bg-red-50 border border-red-100 p-lg hover:bg-red-100/60 transition-all">
                <div className="flex items-center gap-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                    <TriangleAlert size={18} className="text-red-500" strokeWidth={1.75} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-red-700 block">Đơn lỗi / Chưa map</span>
                    <span className="text-[11px] text-red-400">Cần xử lý ngay</span>
                  </div>
                </div>
                <span className="text-[20px] font-black text-red-600 tabular-nums">{unmappedOrders}</span>
              </a>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] p-xl">
            <h2 className="mb-md flex items-center gap-sm text-[14px] font-bold text-gray-700">
              <img src="/heoquatang.png" alt="" className="h-7 w-7 object-contain" />
              Thao tác nhanh
            </h2>
            <div className="grid grid-cols-2 gap-sm">
              {[
                { href: "/admin/customers", label: "Khách hàng", bg: "bg-blue-50", text: "text-blue-600" },
                { href: "/admin/orders/import", label: "Import CSV", bg: "bg-amber-50", text: "text-amber-600" },
                { href: "/admin/payments", label: "Thanh toán", bg: "bg-emerald-50", text: "text-emerald-600" },
                { href: "/admin/reports", label: "Báo cáo", bg: "bg-violet-50", text: "text-violet-600" },
              ].map(({ href, label, bg, text }) => (
                <a key={href} href={href}
                  className={`flex flex-col items-center gap-xs rounded-2xl ${bg} p-md text-center transition-all hover:-translate-y-0.5 hover:shadow-sm`}>
                  <span className={`text-[12px] font-bold ${text}`}>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper inline component tránh import thêm
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-300 group-hover:text-[#e86a33] transition-colors">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
