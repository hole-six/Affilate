"use client";

import { useState } from "react";
import { Search, Wallet, ClipboardList, Send, CreditCard, Smartphone, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { CreatePaymentButton } from "@/components/admin/CreatePaymentButton";
import { MarkPaidForm } from "@/components/admin/MarkPaidForm";

type CustomerPending = {
  id: string;
  name: string;
  code: string;
  amount: number;
  count: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  momoNumber: string | null;
  momoName: string | null;
};

type PaymentBatch = {
  id: string;
  paymentCode: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paidAt: string | null;
};

type Props = {
  pendingList: CustomerPending[];
  batches: PaymentBatch[];
};

const payoutStatusLabel: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  processing: "Đang xử lý",
  paid: "Đã thanh toán",
};

export function AdminPaymentsClient({ pendingList, batches }: Props) {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [search, setSearch] = useState("");

  const filteredPending = pendingList.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.momoNumber?.includes(q) || c.bankAccountNumber?.includes(q);
  });

  const filteredBatches = batches.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.customerName.toLowerCase().includes(q) || b.paymentCode.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-lg fade-in pb-2xl">
      {/* TOOLBAR */}
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, mã khách, số tài khoản..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-md text-[14px] font-medium text-gray-900 shadow-sm ring-1 ring-black/5 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33] transition-all"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton 
          active={activeTab === "pending"} 
          onClick={() => setActiveTab("pending")} 
          label="Chờ thanh toán" 
          count={pendingList.length} 
          icon={<Wallet size={14} />} 
        />
        <TabButton 
          active={activeTab === "history"} 
          onClick={() => setActiveTab("history")} 
          label="Lịch sử phiếu" 
          count={batches.length} 
          icon={<ClipboardList size={14} />} 
        />
      </div>

      {/* CONTENT */}
      {activeTab === "pending" ? (
        <div className="rounded-3xl bg-white p-0 shadow-sm ring-1 ring-black/5 overflow-hidden w-full max-w-[100vw]">
          <div className="responsive-table overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Khách hàng</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Thông tin chuyển khoản</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] text-center">Số đơn</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-[#e86a33] text-[11px] text-right">Số tiền cần hoàn</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] w-[150px] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-2xl text-center">
                      <div className="flex flex-col items-center gap-sm">
                        <CheckCircle size={32} className="text-gray-300" />
                        <span className="text-[14px] font-bold text-gray-400">Không có công nợ chờ thanh toán</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPending.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-[#fff0e6]/20 transition-colors">
                      <td className="px-md py-md" data-label="Khách hàng">
                        <div className="font-bold text-gray-900">{c.name}</div>
                        <div className="font-mono text-[11px] text-gray-400 mt-1">{c.code}</div>
                      </td>
                      <td className="px-md py-md" data-label="Thông tin chuyển khoản">
                        {c.bankAccountNumber || c.momoNumber ? (
                          <div className="flex flex-col gap-2">
                            {c.bankAccountNumber && (
                              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 ring-1 ring-gray-100 min-w-max">
                                <CreditCard size={14} className="text-[#e86a33] shrink-0" />
                                <div>
                                  <div className="text-[11px] font-bold text-gray-900">{c.bankName}</div>
                                  <div className="text-[11px] font-medium text-gray-600 uppercase">
                                    <span className="font-mono">{c.bankAccountNumber}</span> - {c.bankAccountName}
                                  </div>
                                </div>
                              </div>
                            )}
                            {c.momoNumber && (
                              <div className="flex items-center gap-2 rounded-lg bg-[#a50064]/5 p-2 ring-1 ring-[#a50064]/10 min-w-max">
                                <Smartphone size={14} className="text-[#a50064] shrink-0" />
                                <div>
                                  <div className="text-[11px] font-bold text-[#a50064]">Ví Momo</div>
                                  <div className="text-[11px] font-medium text-[#a50064]/80 uppercase">
                                    <span className="font-mono">{c.momoNumber}</span> - {c.momoName}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[12px] font-medium text-gray-400 italic">Chưa cập nhật thông tin</div>
                        )}
                      </td>
                      <td className="px-md py-md text-center font-medium text-gray-600" data-label="Số đơn">
                        {c.count}
                      </td>
                      <td className="px-md py-md text-right" data-label="Số tiền cần hoàn">
                        <div className="font-black text-[#e86a33] text-[16px]">{formatCurrency(c.amount)}</div>
                      </td>
                      <td className="px-md py-md text-right" data-label="Thao tác">
                        <CreatePaymentButton customerId={c.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-0 shadow-sm ring-1 ring-black/5 overflow-hidden w-full max-w-[100vw]">
          <div className="responsive-table overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Mã phiếu</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Khách hàng</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] text-right">Số tiền</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Trạng thái</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Ngày trả</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] w-[150px]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-2xl text-center">
                      <span className="text-[14px] font-bold text-gray-400">Không có phiếu thanh toán nào</span>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-md py-md font-mono font-bold text-gray-900" data-label="Mã phiếu">{b.paymentCode}</td>
                      <td className="px-md py-md font-medium text-gray-700" data-label="Khách hàng">{b.customerName}</td>
                      <td className="px-md py-md text-right font-bold text-gray-900" data-label="Số tiền">{formatCurrency(b.totalAmount)}</td>
                      <td className="px-md py-md" data-label="Trạng thái">
                        <Badge tone={b.status === "paid" ? "positive" : "warning"} dot>
                          {payoutStatusLabel[b.status] ?? b.status}
                        </Badge>
                      </td>
                      <td className="px-md py-md text-[12px] font-medium text-gray-500" data-label="Ngày trả">{b.paidAt || "—"}</td>
                      <td className="px-md py-md" data-label="Thao tác">
                        {b.status !== "paid" && <MarkPaidForm batchId={b.id} />}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label, count, icon }: { active: boolean; onClick: () => void; label: string; count: number; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-10 shrink-0 items-center gap-xs whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-all ${
        active
          ? "border-2 border-gray-900 bg-white text-gray-900 shadow-sm"
          : "border-2 border-transparent bg-white text-gray-500 shadow-sm ring-1 ring-black/5 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon && <span className={active ? "text-gray-900" : "text-gray-400"}>{icon}</span>}
      {label}
      <span className={`ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
        active ? "bg-gray-100 text-gray-900" : "bg-gray-100 text-gray-400"
      }`}>
        {count}
      </span>
    </button>
  );
}
