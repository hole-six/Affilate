"use client";

import { CalendarDays, ExternalLink, Package } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Order = {
  id: string;
  orderExternalId: string;
  platformName: string;
  createdAt: string;
  orderAmount: string;
  customerRewardAmount: string;
  orderStatus: string;
  payoutStatus: string;
};

type Props = {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  counts: { all: number; completed: number; pending: number; processing: number; cancelled: number };
};

export function CustomerOrdersClient({ orders, totalPages, currentPage, counts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getStatusBadge = (order: Order) => {
    if (order.orderStatus === "cancelled" || order.orderStatus === "rejected") {
      return <span className="inline-flex rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600">Đã huỷ</span>;
    }
    if (order.orderStatus === "approved" && order.payoutStatus === "paid") {
      return <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">Hoàn thành</span>;
    }
    if (order.orderStatus === "approved" && order.payoutStatus !== "paid") {
      return <span className="inline-flex rounded-md bg-[#fff0e6] px-2 py-1 text-[11px] font-bold text-[#e86a33]">Đang xử lý</span>;
    }
    return <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-600">Chờ xác nhận</span>;
  };

  const getStatusHint = (order: Order) => {
    if (order.orderStatus === "cancelled" || order.orderStatus === "rejected") return null;
    if (order.orderStatus === "approved") return null;
    return "Shopee chưa xác nhận hoàn thành đơn — tiền hoàn chỉ về sau khi đơn được xác nhận, chưa chắc chắn nhận được.";
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-lg fade-in pb-2xl">
      {/* HEADER */}
      <div className="flex items-center gap-sm">
        <h1 className="text-[28px] font-black tracking-tight text-gray-900">
          Đơn hàng
        </h1>
        <div className="flex h-6 items-center justify-center rounded-full bg-gray-100 px-[10px] text-[12px] font-bold text-gray-500 ring-1 ring-gray-200">
          {counts.all}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <ServerSearchInput placeholder="Tìm mã đơn hoặc tên sản phẩm..." />
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton active={currentTab === "all"} onClick={() => handleTabChange("all")} label="Tất cả" count={counts.all} />
        <TabButton active={currentTab === "completed"} onClick={() => handleTabChange("completed")} label="Hoàn thành" count={counts.completed} />
        <TabButton active={currentTab === "pending"} onClick={() => handleTabChange("pending")} label="Chờ xác nhận" count={counts.pending} />
        <TabButton active={currentTab === "processing"} onClick={() => handleTabChange("processing")} label="Đang xử lý" count={counts.processing} />
        <TabButton active={currentTab === "cancelled"} onClick={() => handleTabChange("cancelled")} label="Đã huỷ" count={counts.cancelled} />
      </div>

      {/* CONTENT LIST */}
      <div className="mt-md rounded-3xl bg-white p-md shadow-sm ring-1 ring-black/5 min-h-[400px]">
        {orders.length === 0 ? (
          <div className="flex h-full min-h-[350px] flex-col items-center justify-center">
            <img src="/heochodoi.png" alt="" className="mb-md h-20 w-20 object-contain opacity-90" />
            <div className="text-[14px] font-bold text-gray-400">Chưa có đơn hàng</div>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {orders.map((o) => (
              <div key={o.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-md rounded-2xl border border-gray-100 p-md transition-all hover:border-[#e86a33]/30 hover:bg-[#fff0e6]/20">
                <div className="flex items-start gap-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 ring-1 ring-gray-100 group-hover:bg-white group-hover:text-[#e86a33]">
                    <Package size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {o.platformName}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[12px] font-medium text-gray-400 flex items-center gap-1">
                        <CalendarDays size={12} />
                        {o.createdAt}
                      </span>
                    </div>
                    <div className="mt-[2px] text-[14px] font-bold text-gray-900 font-mono">
                      {o.orderExternalId}
                    </div>
                    <div className="mt-1 flex items-center gap-xs">
                      {getStatusBadge(o)}
                    </div>
                    {getStatusHint(o) && (
                      <div className="mt-1 max-w-[280px] text-[11px] leading-snug text-amber-600/80">
                        {getStatusHint(o)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-xl sm:text-right mt-sm sm:mt-0 pt-sm border-t border-gray-50 sm:border-0 sm:pt-0">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Giá trị đơn</div>
                    <div className="text-[14px] font-bold text-gray-900">{o.orderAmount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#e86a33]">Tiền hoàn</div>
                    <div className="text-[15px] font-black text-[#e86a33]">{o.customerRewardAmount}</div>
                  </div>
                  <button className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors hover:bg-[#e86a33] hover:text-white">
                    <ExternalLink size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-xs whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-all ${
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
