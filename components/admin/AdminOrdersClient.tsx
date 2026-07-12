"use client";

import { useState } from "react";
import { Search, ChevronDown, Filter, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import { OrderActions } from "@/components/admin/OrderActions";

type Option = { id: string; label: string };

type Order = {
  id: string;
  orderExternalId: string;
  platformName: string;
  customerName: string | null;
  customerId: string | null;
  trackingCode: string | null;
  orderAmount: number;
  customerRewardAmount: number;
  systemProfitAmount: number;
  orderStatus: string;
  payoutStatus: string;
};

type Props = {
  orders: Order[];
  customers: Option[];
};

const orderStatusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  approved: "Đã duyệt",
  cancelled: "Đã huỷ",
  rejected: "Từ chối",
};

const payoutStatusLabel: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

export function AdminOrdersClient({ orders, customers }: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const counts = {
    all: orders.length,
    unmapped: orders.filter((o) => !o.customerId).length,
    pending: orders.filter((o) => o.orderStatus === "pending").length,
    approved: orders.filter((o) => o.orderStatus === "approved").length,
    unpaid: orders.filter((o) => o.orderStatus === "approved" && o.payoutStatus !== "paid").length,
  };

  const filteredOrders = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      const matchId = o.orderExternalId.toLowerCase().includes(q);
      const matchCustomer = o.customerName?.toLowerCase().includes(q) ?? false;
      const matchTracking = o.trackingCode?.toLowerCase().includes(q) ?? false;
      if (!matchId && !matchCustomer && !matchTracking) return false;
    }
    if (activeTab === "unmapped") return !o.customerId;
    if (activeTab === "pending") return o.orderStatus === "pending";
    if (activeTab === "approved") return o.orderStatus === "approved";
    if (activeTab === "unpaid") return o.orderStatus === "approved" && o.payoutStatus !== "paid";
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-lg fade-in pb-2xl">
      {/* TOOLBAR */}
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách hoặc tracking code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-md text-[14px] font-medium text-gray-900 shadow-sm ring-1 ring-black/5 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33] transition-all"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton active={activeTab === "all"} onClick={() => { setActiveTab("all"); setCurrentPage(1); }} label="Tất cả" count={counts.all} />
        <TabButton active={activeTab === "unmapped"} onClick={() => { setActiveTab("unmapped"); setCurrentPage(1); }} label="Chưa map khách" count={counts.unmapped} />
        <TabButton active={activeTab === "pending"} onClick={() => { setActiveTab("pending"); setCurrentPage(1); }} label="Chờ duyệt" count={counts.pending} />
        <TabButton active={activeTab === "approved"} onClick={() => { setActiveTab("approved"); setCurrentPage(1); }} label="Đã duyệt" count={counts.approved} />
        <TabButton active={activeTab === "unpaid"} onClick={() => { setActiveTab("unpaid"); setCurrentPage(1); }} label="Chưa thanh toán" count={counts.unpaid} />
      </div>

      {/* COMPACT TABLE WITH SUMMARY */}
      <div className="rounded-3xl bg-white p-0 shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col gap-0 w-full max-w-[100vw]">
        
        {/* Summary Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 p-lg grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng giá trị đơn</span>
            <span className="text-[20px] font-bold text-gray-900 leading-none">
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.orderAmount, 0))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#e86a33] uppercase tracking-wider mb-1">Tổng hoàn khách</span>
            <span className="text-[20px] font-bold text-[#e86a33] leading-none">
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.customerRewardAmount, 0))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng hệ thống giữ</span>
            <span className="text-[20px] font-bold text-gray-700 leading-none">
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.systemProfitAmount, 0))}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Đơn hàng / Tracking</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Khách hàng</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] text-right">Giá trị đơn</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-[#e86a33] text-[11px] text-right">Tiền hoàn / Giữ lại</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Trạng thái</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] w-[200px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-2xl text-center">
                    <div className="flex flex-col items-center gap-sm">
                      <Package size={32} className="text-gray-300" />
                      <span className="text-[14px] font-bold text-gray-400">Không tìm thấy đơn hàng nào phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-[#fff0e6]/20 transition-colors">
                    {/* Order Info */}
                    <td className="px-md py-sm">
                      <div className="font-mono font-bold text-gray-900">{o.orderExternalId}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-1.5 py-[2px] text-[10px] font-bold text-gray-500 uppercase">{o.platformName}</span>
                        <span className="font-mono text-[11px] text-gray-400">{o.trackingCode || "No tracking"}</span>
                      </div>
                    </td>
                    
                    {/* Customer */}
                    <td className="px-md py-sm">
                      {o.customerName ? (
                        <span className="font-bold text-gray-700">{o.customerName}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Chưa map
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-md py-sm text-right font-medium text-gray-600">
                      {formatCurrency(o.orderAmount)}
                    </td>

                    {/* Commissions */}
                    <td className="px-md py-sm text-right">
                      <div className="font-bold text-[#e86a33] text-[14px]">
                        {formatCurrency(o.customerRewardAmount)}
                      </div>
                      <div className="text-[11px] font-medium text-gray-400 mt-[2px]">
                        Giữ: {formatCurrency(o.systemProfitAmount)}
                      </div>
                    </td>

                    {/* Statuses */}
                    <td className="px-md py-sm">
                      <div className="flex flex-col items-start gap-1">
                        <Badge tone={o.orderStatus === "approved" ? "positive" : o.orderStatus === "cancelled" ? "negative" : "warning"} dot>
                          {orderStatusLabel[o.orderStatus] ?? o.orderStatus}
                        </Badge>
                        <Badge tone={o.payoutStatus === "paid" ? "positive" : "neutral"}>
                          {payoutStatusLabel[o.payoutStatus] ?? o.payoutStatus}
                        </Badge>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-md py-sm">
                      <OrderActions
                        orderId={o.id}
                        orderStatus={o.orderStatus}
                        hasCustomer={Boolean(o.customerId)}
                        customers={customers}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-md py-sm">
            <span className="text-[13px] text-gray-500 font-medium">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trong số {filteredOrders.length} đơn hàng
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-[13px] font-bold text-gray-900 px-2">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 items-center gap-xs rounded-full px-4 text-[13px] font-bold transition-all ${
        active 
          ? "border-2 border-gray-900 bg-white text-gray-900 shadow-sm" 
          : "border-2 border-transparent bg-white text-gray-500 shadow-sm ring-1 ring-black/5 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
      <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
        active ? "bg-gray-100 text-gray-900" : "bg-gray-100 text-gray-400"
      }`}>
        {count}
      </span>
    </button>
  );
}
