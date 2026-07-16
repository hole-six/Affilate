"use client";

import { useState } from "react";
import { Wallet, Clock, CheckCircle2, Building2, Edit2, AlertCircle, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

export const VIETNAM_BANKS = [
  "Vietcombank (Ngân hàng TMCP Ngoại thương VN)",
  "Techcombank (Ngân hàng TMCP Kỹ thương VN)",
  "MB (Ngân hàng TMCP Quân đội)",
  "BIDV (Ngân hàng TMCP Đầu tư và Phát triển VN)",
  "Agribank (Ngân hàng NN&PTNT VN)",
  "VietinBank (Ngân hàng TMCP Công thương VN)",
  "ACB (Ngân hàng TMCP Á Châu)",
  "VPBank (Ngân hàng TMCP VN Thịnh Vượng)",
  "TPBank (Ngân hàng TMCP Tiên Phong)",
  "Sacombank (Ngân hàng TMCP Sài Gòn Thương Tín)",
  "HDBank (Ngân hàng TMCP Phát triển TPHCM)",
  "VIB (Ngân hàng TMCP Quốc tế VN)",
  "SHB (Ngân hàng TMCP Sài Gòn - Hà Nội)",
  "SeABank (Ngân hàng TMCP Đông Nam Á)",
  "MSB (Ngân hàng TMCP Hàng Hải VN)",
  "LienVietPostBank (Ngân hàng Bưu điện Liên Việt)",
  "OCB (Ngân hàng TMCP Phương Đông)",
  "Nam A Bank (Ngân hàng TMCP Nam Á)",
  "Timo (Ngân hàng số Timo)",
  "Cake (Ngân hàng số Cake by VPBank)",
  "Khác...",
];

type PaymentInfo = {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

type Props = {
  stats: {
    available: number;
    pending: number;
    paid: number;
  };
  history: any[];
  totalPages: number;
  currentPage: number;
  paymentInfo: PaymentInfo;
};

export function CustomerWalletClient({ stats, history, totalPages, currentPage, paymentInfo: initialPaymentInfo }: Props) {
  const router = useRouter();
  const [requestAmount, setRequestAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Profile State
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(initialPaymentInfo);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State inside Modal
  const [formBankName, setFormBankName] = useState(initialPaymentInfo.bankName || "");
  const [formBankAccountNumber, setFormBankAccountNumber] = useState(initialPaymentInfo.bankAccountNumber || "");
  const [formBankAccountName, setFormBankAccountName] = useState(initialPaymentInfo.bankAccountName || "");

  const handleRequestAll = () => {
    setRequestAmount(stats.available.toString());
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(requestAmount) < 10000) {
      setError("Số tiền rút tối thiểu là 10.000 VNĐ");
      return;
    }
    if (Number(requestAmount) > stats.available) {
      setError("Số dư không đủ");
      return;
    }
    if (!paymentInfo.bankName || !paymentInfo.bankAccountNumber) {
      setError("Vui lòng cập nhật thông tin Ngân hàng trước khi rút");
      return;
    }
    setError(null);
    alert("Tính năng gửi yêu cầu thanh toán đang được phát triển!");
  };

  const handleSavePaymentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: formBankName,
          bankAccountNumber: formBankAccountNumber,
          bankAccountName: formBankAccountName,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const { customer } = await res.json();
      setPaymentInfo(customer);
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      alert("Đã có lỗi xảy ra khi lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = () => {
    setFormBankName(paymentInfo.bankName || "");
    setFormBankAccountNumber(paymentInfo.bankAccountNumber || "");
    setFormBankAccountName(paymentInfo.bankAccountName || "");
    setIsModalOpen(true);
  };

  const renderAccountInfoBox = () => {
    if (paymentInfo.bankName && paymentInfo.bankAccountNumber) {
      return (
        <div className="rounded-lg bg-white p-sm shadow-sm ring-1 ring-black/5">
          <div className="text-[13px] font-bold text-gray-900">{paymentInfo.bankName}</div>
          <div className="text-[12px] font-medium text-gray-500 uppercase">
            {paymentInfo.bankAccountNumber} - {paymentInfo.bankAccountName}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-md rounded-lg bg-white p-sm shadow-sm ring-1 ring-black/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          <AlertCircle size={16} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[13px] font-bold text-gray-900">Chưa có thông tin</div>
          <div className="text-[11px] font-medium text-gray-400">Vui lòng cập nhật</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mx-auto flex max-w-5xl flex-col gap-xl fade-in pb-2xl">
        {/* HEADER */}
        <div className="flex items-center gap-md">
          <img src="/heovitien.png" alt="" className="h-14 w-14 object-contain" />
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight text-gray-900">
              Thanh Toán
            </h1>
            <p className="mt-1 text-[14px] font-medium text-gray-500">
              Quản lý số dư, yêu cầu thanh toán và xem lịch sử
            </p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          {/* Available (Orange Card) */}
          <div className="relative overflow-hidden rounded-2xl bg-[#e86a33] p-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-sm text-white/90">
                <Wallet size={16} strokeWidth={2.5} />
                <span className="text-[13px] font-bold">Khả dụng</span>
              </div>
              <div className="mt-md text-[32px] font-black text-white tabular-nums tracking-tight">
                {formatCurrency(stats.available)}
              </div>
            </div>
          </div>

          {/* Pending (White Card) */}
          <div className="rounded-2xl bg-white p-xl shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-sm text-[#f59e0b]">
              <Clock size={16} strokeWidth={2.5} />
              <span className="text-[13px] font-bold">Chờ duyệt</span>
            </div>
            <div className="mt-md text-[24px] font-black text-gray-900 tabular-nums tracking-tight">
              {formatCurrency(stats.pending)}
            </div>
            <div className="mt-xs text-[11px] font-medium text-gray-400">Đang chờ admin duyệt</div>
          </div>

          {/* Paid (White Card) */}
          <div className="rounded-2xl bg-white p-xl shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-sm text-[#2bc48a]">
              <CheckCircle2 size={16} strokeWidth={2.5} />
              <span className="text-[13px] font-bold">Đã nhận</span>
            </div>
            <div className="mt-md text-[24px] font-black text-gray-900 tabular-nums tracking-tight">
              {formatCurrency(stats.paid)}
            </div>
            <div className="mt-xs text-[11px] font-medium text-gray-400">Tổng đã thanh toán thành công</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl lg:grid-cols-[1fr_2fr] items-start">
          {/* LEFT COLUMN: PAYMENT REQUEST FORM */}
          <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/5">
            <h2 className="text-[16px] font-bold text-gray-900 mb-xl">Tạo yêu cầu thanh toán</h2>
            
            <form onSubmit={handleSubmitRequest} className="flex flex-col gap-lg">
              {/* Available Balance */}
              <div>
                <label className="mb-sm block text-[13px] font-bold text-gray-600">Số dư khả dụng</label>
                <div className="flex h-12 w-full items-center rounded-xl bg-gray-50 px-md text-[14px] font-bold text-gray-900 ring-1 ring-gray-100">
                  {formatCurrency(stats.available)}
                </div>
              </div>

              {/* Request Amount */}
              <div>
                <label className="mb-sm block text-[13px] font-bold text-gray-600">Số tiền yêu cầu</label>
                <div className="relative">
                  <input
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="0"
                    className="h-12 w-full rounded-xl bg-white px-md pr-[100px] text-[15px] font-bold text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/50 transition-all"
                  />
                  <div className="absolute right-xs top-1/2 -translate-y-1/2 flex items-center gap-sm">
                    <span className="text-[13px] font-bold text-gray-400">VNĐ</span>
                    <button
                      type="button"
                      onClick={handleRequestAll}
                      className="rounded-lg bg-gray-100 px-sm py-[6px] text-[12px] font-bold text-[#e86a33] transition-colors hover:bg-gray-200"
                    >
                      Toàn bộ
                    </button>
                  </div>
                </div>
                <div className="mt-xs flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">Tối thiểu 10.000 VNĐ</span>
                  {error && <span className="text-[12px] font-bold text-red-500">{error}</span>}
                </div>
              </div>

              {/* Account Info */}
              <div className="rounded-xl bg-gray-50 p-md ring-1 ring-gray-100">
                <div className="mb-sm flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Thông tin tài khoản nhận
                  </span>
                  <button 
                    type="button" 
                    onClick={openModal}
                    className="flex items-center gap-[4px] text-[12px] font-bold text-[#e86a33] hover:text-[#d65d2a]"
                  >
                    <Edit2 size={12} strokeWidth={2.5} />
                    Chỉnh sửa
                  </button>
                </div>
                
                {renderAccountInfoBox()}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-sm flex h-12 w-full items-center justify-center rounded-xl bg-[#ffcca7] text-[15px] font-bold text-[#e86a33] transition-all hover:bg-[#ffbfa7] hover:text-[#d65d2a] active:scale-[0.98]"
              >
                Xác nhận thanh toán
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: TRANSACTION HISTORY */}
          <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
            <div className="mb-lg flex items-center justify-between border-b border-gray-100 pb-md">
              <h2 className="text-[16px] font-bold text-gray-900">Lịch sử giao dịch</h2>
              <span className="text-[13px] font-medium text-gray-400">{history.length} giao dịch</span>
            </div>

            <div className="responsive-table overflow-x-auto -mx-xl">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-sm px-md text-[11px] font-bold uppercase tracking-wider text-gray-400">Thời gian</th>
                    <th className="py-sm px-md text-[11px] font-bold uppercase tracking-wider text-gray-400">Số tiền</th>
                    <th className="py-sm px-md text-[11px] font-bold uppercase tracking-wider text-gray-400">Trạng thái</th>
                    <th className="py-sm px-md text-[11px] font-bold uppercase tracking-wider text-gray-400">Mã phiếu</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-2xl text-center">
                        <span className="text-[14px] font-bold text-gray-400">Chưa có giao dịch nào</span>
                      </td>
                    </tr>
                  ) : (
                    history.map((tx, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-md px-md text-[13px] font-medium text-gray-600">{tx.time}</td>
                        <td className="py-md px-md text-[13px] font-bold text-gray-900">{tx.amount}</td>
                        <td className="py-md px-md text-[13px] font-medium text-gray-600">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold ${
                            tx.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tx.status === 'paid' ? 'Đã nhận' : tx.status}
                          </span>
                        </td>
                        <td className="py-md px-md text-[13px] font-mono text-gray-500">{tx.code}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </div>
        </div>
      </div>

      {/* MODAL: CHỈNH SỬA THÔNG TIN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl fade-in-up">
            <div className="flex items-center justify-between border-b border-gray-100 p-lg">
              <h3 className="text-[18px] font-bold text-gray-900">Thông tin thanh toán</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSavePaymentInfo} className="p-lg">
              <div className="space-y-lg">
                {/* Bank Section */}
                <div>
                  <h4 className="mb-sm flex items-center gap-xs text-[14px] font-bold text-gray-900">
                    <Building2 size={16} className="text-[#e86a33]" />
                    Chuyển khoản Ngân hàng
                  </h4>
                  <div className="space-y-sm">
                    <div>
                      <label className="mb-xs block text-[12px] font-bold text-gray-600">Ngân hàng</label>
                      <select 
                        value={formBankName}
                        onChange={(e) => setFormBankName(e.target.value)}
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-md text-[14px] font-medium text-gray-900 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33]"
                      >
                        <option value="">-- Chọn ngân hàng --</option>
                        {VIETNAM_BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-xs block text-[12px] font-bold text-gray-600">Số tài khoản</label>
                      <input 
                        type="text"
                        value={formBankAccountNumber}
                        onChange={(e) => setFormBankAccountNumber(e.target.value)}
                        placeholder="VD: 1903..."
                        className="h-11 w-full rounded-xl border border-gray-200 px-md text-[14px] font-medium focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33]"
                      />
                    </div>
                    <div>
                      <label className="mb-xs block text-[12px] font-bold text-gray-600">Tên chủ tài khoản</label>
                      <input 
                        type="text"
                        value={formBankAccountName}
                        onChange={(e) => setFormBankAccountName(e.target.value)}
                        placeholder="VD: NGUYEN VAN A"
                        className="h-11 w-full rounded-xl border border-gray-200 px-md text-[14px] font-medium uppercase focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-xl flex gap-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-12 flex-1 rounded-xl bg-gray-100 text-[14px] font-bold text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex h-12 flex-1 items-center justify-center gap-sm rounded-xl bg-[#e86a33] text-[14px] font-bold text-white transition-colors hover:bg-[#d65d2a] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
