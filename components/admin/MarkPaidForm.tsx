"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, Upload, FileImage, Loader2, AlertTriangle } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";

type BatchItemBreakdown = {
  id: string;
  amount: number;
  order: {
    id: string;
    orderExternalId: string;
    itemName: string | null;
    orderAmount: number | null;
    commissionAmount: number;
    customerRewardAmount: number;
    referralBonusDeducted: number;
    platform?: { name: string } | null;
  };
};

function formatVnd(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

// Cảnh báo khi hoa hồng lớn hơn hẳn giá trị đơn hàng — dấu hiệu số liệu CSV
// bị đọc sai (vd dấu thập phân bị hiểu nhầm thành dấu phân cách nghìn, từng
// khiến hoa hồng 373,725đ bị lưu thành 373.725 -> 373725đ, chuyển nhầm cho
// khách gấp ~1000 lần số thật).
function isSuspicious(item: BatchItemBreakdown) {
  const orderAmount = Number(item.order.orderAmount ?? 0);
  const commission = Number(item.order.commissionAmount ?? 0);
  return orderAmount > 0 && commission > orderAmount;
}

function BatchBreakdown({
  batchId,
  onSuspiciousChange,
}: {
  batchId: string;
  onSuspiciousChange: (count: number) => void;
}) {
  const [items, setItems] = useState<BatchItemBreakdown[] | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/payments/${batchId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const loadedItems: BatchItemBreakdown[] = d.batch?.items ?? [];
        setItems(loadedItems);
        setTotalAmount(d.batch ? Number(d.batch.totalAmount) : null);
        onSuspiciousChange(loadedItems.filter(isSuspicious).length);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  if (items === null) {
    return <p className="text-[12px] text-gray-400">Đang tải chi tiết đơn hàng...</p>;
  }

  const suspiciousCount = items.filter(isSuspicious).length;

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">
          Chi tiết đơn hàng ({items.length})
        </label>
        {totalAmount != null && (
          <span className="text-[12px] font-black text-emerald-600">{formatVnd(totalAmount)}</span>
        )}
      </div>

      {suspiciousCount > 0 && (
        <div className="flex items-start gap-xs rounded-xl border border-red-200 bg-red-50 p-sm">
          <AlertTriangle size={14} className="mt-[1px] shrink-0 text-red-500" />
          <p className="text-[11px] font-semibold text-red-600">
            {suspiciousCount} đơn có hoa hồng LỚN HƠN giá trị đơn hàng — khả năng số liệu CSV bị đọc sai. Kiểm tra kỹ trước khi chuyển khoản.
          </p>
        </div>
      )}

      <div className="flex max-h-56 flex-col gap-xs overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-xs">
        {items.map((item) => {
          const suspicious = isSuspicious(item);
          return (
            <div
              key={item.id}
              className={`rounded-xl border p-sm text-[11px] ${
                suspicious ? "border-red-300 bg-red-50" : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-sm">
                <p className="truncate font-semibold text-gray-800">
                  {item.order.itemName ?? item.order.orderExternalId}
                </p>
                {suspicious && <AlertTriangle size={12} className="shrink-0 text-red-500" />}
              </div>
              <div className="mt-[2px] flex flex-wrap items-center gap-x-sm gap-y-[2px] text-[10px] text-gray-500">
                <span className="font-mono">{item.order.orderExternalId}</span>
                <span>Giá: {formatVnd(Number(item.order.orderAmount ?? 0))}</span>
                <span className={suspicious ? "font-bold text-red-600" : ""}>
                  Hoa hồng: {formatVnd(Number(item.order.commissionAmount ?? 0))}
                </span>
                {Number(item.order.referralBonusDeducted ?? 0) > 0 && (
                  <span>HH giới thiệu: {formatVnd(Number(item.order.referralBonusDeducted))}</span>
                )}
                <span className="font-bold text-emerald-600">
                  Khách nhận: {formatVnd(Number(item.amount))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarkPaidForm({ batchId }: { batchId: string }) {
  const router = useRouter();
  const modal = useModal();
  const [open, setOpen] = useState(false);
  const [transferReference, setTransferReference] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [bill, setBill] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (suspiciousCount > 0) {
      const confirmed = await modal.confirm({
        title: "Số liệu bất thường trong phiếu",
        message: `${suspiciousCount} đơn trong phiếu này có hoa hồng LỚN HƠN giá trị đơn hàng — rất có thể số liệu CSV bị đọc sai và số tiền chuyển khoản không đúng. Vẫn muốn xác nhận đã chuyển khoản?`,
        confirmText: "Vẫn xác nhận",
        cancelText: "Để tôi kiểm tra lại",
        iconType: "danger",
      });
      if (!confirmed) return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("transferReference", transferReference);
    formData.append("transferNote", transferNote);
    if (bill) formData.append("bill", bill);

    await fetch(`/api/payments/${batchId}`, { method: "PATCH", body: formData });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-xs rounded-xl bg-emerald-500 px-sm text-[12px] font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
      >
        <CheckCircle2 size={13} strokeWidth={2.5} />
        Đã chuyển khoản
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-md"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal card */}
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl fade-in"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-xl py-lg border-b border-gray-100"
              style={{ background: "linear-gradient(135deg,#e8f5e9,#f1fdf2)" }}
            >
              <div className="flex items-center gap-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle2 size={18} className="text-emerald-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-gray-900">Xác nhận đã chuyển khoản</h3>
                  <p className="text-[11px] text-gray-400">Tất cả trường bên dưới là tuỳ chọn</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-md p-xl">

              {/* Chi tiết đơn hàng cấu thành số tiền chuyển khoản */}
              {open && <BatchBreakdown batchId={batchId} onSuspiciousChange={setSuspiciousCount} />}

              {/* Mã giao dịch */}
              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">
                  Mã giao dịch
                  <span className="ml-sm text-[10px] font-medium text-gray-400 normal-case tracking-normal">(không bắt buộc)</span>
                </label>
                <input
                  type="text"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="VD: FT2507150001..."
                  className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-md text-[14px] font-medium text-gray-900 placeholder:text-gray-300 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
              </div>

              {/* Ghi chú */}
              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">
                  Ghi chú
                  <span className="ml-sm text-[10px] font-medium text-gray-400 normal-case tracking-normal">(không bắt buộc)</span>
                </label>
                <textarea
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Thêm ghi chú nếu cần..."
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-md py-sm text-[14px] font-medium text-gray-900 placeholder:text-gray-300 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
              </div>

              {/* Upload bill */}
              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">
                  Ảnh bill chuyển khoản
                  <span className="ml-sm text-[10px] font-medium text-gray-400 normal-case tracking-normal">(không bắt buộc)</span>
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setBill(e.target.files?.[0] ?? null)}
                />
                {bill ? (
                  <div className="flex items-center gap-sm rounded-2xl border border-emerald-200 bg-emerald-50 p-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <FileImage size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-emerald-700 truncate">{bill.name}</p>
                      <p className="text-[11px] text-emerald-500">{(bill.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBill(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                    >
                      <X size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-sm rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-md text-[13px] font-semibold text-gray-400 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-500 transition-all"
                  >
                    <Upload size={16} strokeWidth={2} />
                    Tải ảnh bill lên
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-sm border-t border-gray-100 px-xl py-lg">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-gray-100 text-[14px] font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 flex-[2] items-center justify-center gap-sm rounded-2xl bg-emerald-500 text-[14px] font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-600 transition-all disabled:opacity-60 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                    Xác nhận thanh toán
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
