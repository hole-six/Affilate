"use client";

import { useState } from "react";
import { Wallet, Clock, CheckCircle2, Building2, Edit2, AlertCircle, X, Loader2, BellRing } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

export const VIETNAM_BANKS = [
  // Ngân hàng quốc doanh / nhà nước chi phối
  "Vietcombank (Ngân hàng TMCP Ngoại thương VN)",
  "VietinBank (Ngân hàng TMCP Công thương VN)",
  "BIDV (Ngân hàng TMCP Đầu tư và Phát triển VN)",
  "Agribank (Ngân hàng NN&PTNT VN)",
  // Ngân hàng TMCP
  "Techcombank (Ngân hàng TMCP Kỹ thương VN)",
  "MB (Ngân hàng TMCP Quân đội)",
  "ACB (Ngân hàng TMCP Á Châu)",
  "VPBank (Ngân hàng TMCP VN Thịnh Vượng)",
  "TPBank (Ngân hàng TMCP Tiên Phong)",
  "Sacombank (Ngân hàng TMCP Sài Gòn Thương Tín)",
  "HDBank (Ngân hàng TMCP Phát triển TPHCM)",
  "VIB (Ngân hàng TMCP Quốc tế VN)",
  "SHB (Ngân hàng TMCP Sài Gòn - Hà Nội)",
  "SeABank (Ngân hàng TMCP Đông Nam Á)",
  "MSB (Ngân hàng TMCP Hàng Hải VN)",
  "LPBank (Ngân hàng TMCP Lộc Phát VN)",
  "OCB (Ngân hàng TMCP Phương Đông)",
  "Nam A Bank (Ngân hàng TMCP Nam Á)",
  "Eximbank (Ngân hàng TMCP Xuất Nhập khẩu VN)",
  "VietABank (Ngân hàng TMCP Việt Á)",
  "NCB (Ngân hàng TMCP Quốc Dân)",
  "Bac A Bank (Ngân hàng TMCP Bắc Á)",
  "PVcomBank (Ngân hàng TMCP Đại Chúng VN)",
  "Saigonbank (Ngân hàng TMCP Sài Gòn Công Thương)",
  "KienlongBank (Ngân hàng TMCP Kiên Long)",
  "VietBank (Ngân hàng TMCP Việt Nam Thương Tín)",
  "BaoVietBank (Ngân hàng TMCP Bảo Việt)",
  "PGBank (Ngân hàng TMCP Thịnh Vượng và Phát triển)",
  "ABBank (Ngân hàng TMCP An Bình)",
  "SCB (Ngân hàng TMCP Sài Gòn)",
  "BVBank (Ngân hàng TMCP Bản Việt)",
  "GPBank (Ngân hàng TM TNHH MTV Dầu Khí Toàn Cầu)",
  "MBV (Ngân hàng TM TNHH MTV Đại Dương)",
  "CBBank (Ngân hàng TM TNHH MTV Xây dựng VN)",
  // Ngân hàng chính sách / hợp tác xã
  "VBSP (Ngân hàng Chính sách Xã hội)",
  "Co-opBank (Ngân hàng Hợp tác xã VN)",
  // Ngân hàng 100% vốn nước ngoài / liên doanh tại VN
  "HSBC Việt Nam",
  "Standard Chartered Việt Nam",
  "Shinhan Bank Việt Nam",
  "Woori Bank Việt Nam",
  "Public Bank Việt Nam (PBVN)",
  "CIMB Việt Nam",
  "UOB Việt Nam",
  "Hong Leong Bank Việt Nam",
  "Indovina Bank",
  "ANZ Việt Nam",
  // Ngân hàng số
  "Cake by VPBank",
  "Ubank by VPBank",
  "Liobank by OCB",
  "Timo",
  "Khác...",
];

type PaymentInfo = {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

type PendingRequest = {
  id: string;
  amount: number;
  createdAt: string;
} | null;

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
  pendingRequest: PendingRequest;
};

const MIN_WITHDRAW_AMOUNT = 10000;

export function CustomerWalletClient({
  stats,
  history,
  totalPages,
  currentPage,
  paymentInfo: initialPaymentInfo,
  pendingRequest: initialPendingRequest,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest>(initialPendingRequest);

  // Profile State
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(initialPaymentInfo);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State inside Modal
  const [formBankName, setFormBankName] = useState(initialPaymentInfo.bankName || "");
  const [formBankAccountNumber, setFormBankAccountNumber] = useState(initialPaymentInfo.bankAccountNumber || "");
  const [formBankAccountName, setFormBankAccountName] = useState(initialPaymentInfo.bankAccountName || "");
  const [bankSearch, setBankSearch] = useState(initialPaymentInfo.bankName || "");
  const [showBankOptions, setShowBankOptions] = useState(false);
  const filteredBanks = VIETNAM_BANKS.filter((b) => b.toLowerCase().includes(bankSearch.trim().toLowerCase()));

  const hasBankInfo = !!(paymentInfo.bankName && paymentInfo.bankAccountNumber && paymentInfo.bankAccountName);
  const canRequest = stats.available >= MIN_WITHDRAW_AMOUNT && hasBankInfo && !pendingRequest;

  const handleSubmitRequest = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/withdraw-requests", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không thể gửi yêu cầu, vui lòng thử lại");
        return;
      }
      setPendingRequest(data.request);
      router.refresh();
    } catch {
      setError("Đã có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
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
    setBankSearch(paymentInfo.bankName || "");
    setShowBankOptions(false);
    setIsModalOpen(true);
  };

  const selectBank = (bank: string) => {
    setFormBankName(bank);
    setBankSearch(bank);
    setShowBankOptions(false);
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
          {/* LEFT COLUMN: PAYMENT REQUEST */}
          <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/5">
            <h2 className="text-[16px] font-bold text-gray-900 mb-xl">Yêu cầu rút tiền</h2>

            <div className="flex flex-col gap-lg">
              {/* Available Balance */}
              <div>
                <label className="mb-sm block text-[13px] font-bold text-gray-600">Số dư khả dụng</label>
                <div className="flex h-12 w-full items-center rounded-xl bg-gray-50 px-md text-[15px] font-black text-gray-900 ring-1 ring-gray-100">
                  {formatCurrency(stats.available)}
                </div>
                {stats.available < MIN_WITHDRAW_AMOUNT && (
                  <p className="mt-xs text-[11px] font-medium text-gray-400">
                    Cần tối thiểu {formatCurrency(MIN_WITHDRAW_AMOUNT)} mới gửi được yêu cầu rút tiền
                  </p>
                )}
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

              {error && <p className="text-[12px] font-bold text-red-500">{error}</p>}

              {pendingRequest ? (
                <div className="flex items-start gap-sm rounded-xl bg-amber-50 p-md ring-1 ring-amber-100">
                  <BellRing size={18} className="mt-[2px] shrink-0 text-amber-500" strokeWidth={2.25} />
                  <div>
                    <div className="text-[13px] font-bold text-amber-700">Đã gửi yêu cầu, đang chờ xử lý</div>
                    <div className="text-[12px] text-amber-600">
                      Bạn đã yêu cầu rút {formatCurrency(pendingRequest.amount)}. Admin sẽ xử lý và chuyển khoản sớm nhất.
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={!canRequest || submitting}
                  className="flex h-12 w-full items-center justify-center gap-sm rounded-xl bg-[#e86a33] text-[15px] font-bold text-white transition-all hover:bg-[#d65d2a] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    `Yêu cầu rút ${formatCurrency(stats.available)}`
                  )}
                </button>
              )}
              {!hasBankInfo && !pendingRequest && (
                <p className="text-[11px] font-medium text-gray-400 -mt-sm">
                  Cần cập nhật thông tin tài khoản ngân hàng trước khi gửi yêu cầu.
                </p>
              )}
            </div>
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
                    <div className="relative">
                      <label className="mb-xs block text-[12px] font-bold text-gray-600">Ngân hàng</label>
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(e) => {
                          setBankSearch(e.target.value);
                          setFormBankName("");
                          setShowBankOptions(true);
                        }}
                        onFocus={() => setShowBankOptions(true)}
                        onBlur={() => setTimeout(() => setShowBankOptions(false), 150)}
                        placeholder="Gõ để tìm ngân hàng..."
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-md text-[14px] font-medium text-gray-900 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33]"
                      />
                      {showBankOptions && (
                        <div className="absolute z-10 mt-xs max-h-[220px] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                          {filteredBanks.length === 0 ? (
                            <div className="px-md py-sm text-[13px] text-gray-400">Không tìm thấy ngân hàng phù hợp</div>
                          ) : (
                            filteredBanks.map((b) => (
                              <button
                                key={b}
                                type="button"
                                onMouseDown={() => selectBank(b)}
                                className={`block w-full px-md py-sm text-left text-[13px] font-medium transition-colors hover:bg-orange-50 ${
                                  b === formBankName ? "bg-orange-50 text-[#e86a33]" : "text-gray-700"
                                }`}
                              >
                                {b}
                              </button>
                            ))
                          )}
                        </div>
                      )}
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
