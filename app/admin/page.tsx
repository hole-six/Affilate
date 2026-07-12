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
  Activity
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

  return (
    <div className="flex flex-col gap-2xl">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Tổng quan hệ thống</h1>
        <p className="mt-1 text-[14px] text-gray-500">
          Hiệu suất affiliate và số dư công nợ toàn hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Cột trái: TÀI CHÍNH */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          <Card className="flex-1 p-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3xl opacity-10 pointer-events-none">
               <CircleDollarSign size={200} />
            </div>
            <div className="p-2xl relative z-10 bg-gradient-to-br from-[#fff0e6]/50 to-white">
              <div className="flex items-center gap-xs mb-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e86a33]/10 text-[#e86a33]">
                  <TrendingUp size={16} strokeWidth={2} />
                </div>
                <h2 className="text-[14px] font-bold text-gray-700">Doanh thu & Lợi nhuận</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl">
                <div>
                  <div className="text-[13px] font-medium text-gray-500 mb-1">Tổng hoa hồng nhận về</div>
                  <div className="text-[36px] font-bold tracking-tight text-gray-900 leading-none">
                    {formatCurrency(commission)}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-gray-500 mb-1">Hệ thống thực giữ</div>
                  <div className="text-[36px] font-bold tracking-tight text-[#e86a33] leading-none">
                    {formatCurrency(profit)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-gray-100 bg-gray-50/50">
              <div className="p-xl border-r border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={16} className="text-gray-400" />
                  <span className="text-[13px] font-semibold text-gray-700">Công nợ khách hàng</span>
                </div>
                <div className="text-[20px] font-bold text-gray-900">{formatCurrency(debt)}</div>
                <p className="text-[12px] text-gray-500 mt-1">Cần hoàn trả cho khách</p>
              </div>
              <div className="p-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CircleCheck size={16} className="text-positive" />
                  <span className="text-[13px] font-semibold text-gray-700">Đã thanh toán</span>
                </div>
                <div className="text-[20px] font-bold text-gray-900">{formatCurrency(paid)}</div>
                <p className="text-[12px] text-gray-500 mt-1">Đã chuyển khoản thành công</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Cột phải: VẬN HÀNH */}
        <div className="flex flex-col gap-lg">
          <Card className="flex-1 p-xl flex flex-col gap-xl bg-white">
            <div className="flex items-center gap-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <Activity size={16} strokeWidth={2} />
              </div>
              <h2 className="text-[14px] font-bold text-gray-700">Chỉ số vận hành</h2>
            </div>

            <div className="flex items-center justify-between p-lg rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <Users size={18} className="text-[#e86a33]" />
                </div>
                <span className="text-[14px] font-semibold text-gray-700">Khách hàng</span>
              </div>
              <span className="text-[20px] font-bold text-gray-900">{totalCustomers}</span>
            </div>

            <div className="flex items-center justify-between p-lg rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <Link2 size={18} className="text-[#e86a33]" />
                </div>
                <span className="text-[14px] font-semibold text-gray-700">Link Affiliate</span>
              </div>
              <span className="text-[20px] font-bold text-gray-900">{totalLinks}</span>
            </div>

            <div className="flex items-center justify-between p-lg rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <Package size={18} className="text-[#e86a33]" />
                </div>
                <span className="text-[14px] font-semibold text-gray-700">Đơn hàng</span>
              </div>
              <span className="text-[20px] font-bold text-gray-900">{totalOrders}</span>
            </div>

            {unmappedOrders > 0 && (
              <div className="flex items-center justify-between p-lg rounded-xl bg-red-50 border border-red-100 mt-auto">
                <div className="flex items-center gap-3">
                  <TriangleAlert size={18} className="text-red-500" />
                  <span className="text-[13px] font-semibold text-red-700">Đơn lỗi / Chưa map</span>
                </div>
                <span className="text-[16px] font-bold text-red-600">{unmappedOrders}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
