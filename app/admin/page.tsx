import {
  Users,
  Link2,
  Package,
  CircleDollarSign,
  Gift,
  Landmark,
  CircleCheck,
  TriangleAlert,
  TrendingUp,
  Activity,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
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

  const kpis = [
    { label: "Khách hàng", value: totalCustomers, icon: Users },
    { label: "Link Affiliate", value: totalLinks, icon: Link2 },
    { label: "Đơn hàng", value: totalOrders, icon: Package },
    { label: "Đã hoàn tiền", value: formatCurrency(paid), icon: Wallet },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <div>
        <h1 className="text-[26px] font-black tracking-tight text-ink">Tổng quan hệ thống</h1>
        <p className="mt-1 text-[14px] text-mute">
          Hiệu suất affiliate và số dư công nợ toàn hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-lg p-xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-active text-white shadow-md shadow-primary/25">
              <Icon size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[20px] font-black leading-none text-ink">{value}</div>
              <div className="mt-1.5 truncate text-[13px] font-semibold text-mute">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Cột trái: TÀI CHÍNH */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          <Card className="flex-1 p-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3xl opacity-[0.07] pointer-events-none text-primary">
               <CircleDollarSign size={200} />
            </div>
            <div className="p-2xl relative z-10 bg-gradient-to-br from-primary/[0.06] to-canvas">
              <div className="flex items-center gap-xs mb-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingUp size={16} strokeWidth={2} />
                </div>
                <h2 className="text-[14px] font-bold text-ink">Doanh thu & Lợi nhuận</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl">
                <div>
                  <div className="text-[13px] font-medium text-mute mb-1">Tổng hoa hồng nhận về</div>
                  <div className="text-[36px] font-black tracking-tight text-ink leading-none">
                    {formatCurrency(commission)}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-mute mb-1">Hệ thống thực giữ</div>
                  <div className="text-[36px] font-black tracking-tight text-primary leading-none">
                    {formatCurrency(profit)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-ink/5 bg-canvas-soft/50">
              <div className="p-xl border-r border-ink/5">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={16} className="text-mute" />
                  <span className="text-[13px] font-semibold text-ink">Công nợ khách hàng</span>
                </div>
                <div className="text-[20px] font-bold text-ink">{formatCurrency(debt)}</div>
                <p className="text-[12px] text-mute mt-1">Cần hoàn trả cho khách</p>
              </div>
              <div className="p-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CircleCheck size={16} className="text-positive" />
                  <span className="text-[13px] font-semibold text-ink">Đã thanh toán</span>
                </div>
                <div className="text-[20px] font-bold text-ink">{formatCurrency(paid)}</div>
                <p className="text-[12px] text-mute mt-1">Đã chuyển khoản thành công</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Cột phải: VẬN HÀNH */}
        <div className="flex flex-col gap-lg">
          <Card className="flex-1 p-xl flex flex-col gap-xl">
            <div className="flex items-center gap-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/5 text-ink">
                <Activity size={16} strokeWidth={2} />
              </div>
              <h2 className="text-[14px] font-bold text-ink">Chỉ số vận hành</h2>
            </div>

            <div className="flex items-center justify-between p-lg rounded-xl bg-canvas-soft/70 border border-ink/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas shadow-sm">
                  <Users size={18} className="text-primary" />
                </div>
                <span className="text-[14px] font-semibold text-ink">Khách hàng</span>
              </div>
              <span className="text-[20px] font-bold text-ink">{totalCustomers}</span>
            </div>

            <div className="flex items-center justify-between p-lg rounded-xl bg-canvas-soft/70 border border-ink/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas shadow-sm">
                  <Link2 size={18} className="text-primary" />
                </div>
                <span className="text-[14px] font-semibold text-ink">Link Affiliate</span>
              </div>
              <span className="text-[20px] font-bold text-ink">{totalLinks}</span>
            </div>

            <div className="flex items-center justify-between p-lg rounded-xl bg-canvas-soft/70 border border-ink/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas shadow-sm">
                  <Package size={18} className="text-primary" />
                </div>
                <span className="text-[14px] font-semibold text-ink">Đơn hàng</span>
              </div>
              <span className="text-[20px] font-bold text-ink">{totalOrders}</span>
            </div>

            {unmappedOrders > 0 && (
              <div className="flex items-center justify-between p-lg rounded-xl bg-negative/10 border border-negative/20 mt-auto">
                <div className="flex items-center gap-3">
                  <TriangleAlert size={18} className="text-negative" />
                  <span className="text-[13px] font-semibold text-negative-darkest">Đơn lỗi / Chưa map</span>
                </div>
                <span className="text-[16px] font-bold text-negative-darkest">{unmappedOrders}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
