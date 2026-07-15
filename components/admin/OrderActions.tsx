"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle, UserPlus, AlertTriangle, XCircle } from "lucide-react";

type Option = { id: string; label: string };

export function OrderActions({
  orderId,
  orderStatus,
  payoutStatus,
  hasCustomer,
  customers,
}: {
  orderId: string;
  orderStatus: string;
  payoutStatus: string;
  hasCustomer: boolean;
  customers: Option[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClawbackConfirm, setShowClawbackConfirm] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Có lỗi xảy ra");
    }
  }

  // Trạng thái cuối — không có thao tác
  if (orderStatus === "clawback") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
        <XCircle size={12} /> Đã clawback
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-xs">
      {/* Gán khách hàng */}
      {!hasCustomer && (
        <div className="flex items-center gap-xs">
          <select
            className="rounded-lg border border-gray-100 bg-canvas px-sm py-[6px] text-[12px] text-gray-900 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Gán khách...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            disabled={!customerId || loading}
            onClick={() => patch({ customerId })}
          >
            <UserPlus size={13} strokeWidth={1.75} />
            Gán
          </Button>
        </div>
      )}

      <div className="flex items-center gap-xs flex-wrap">
        {/* Duyệt thông thường (pending → approved) */}
        {orderStatus === "pending" && (
          <Button
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={() => patch({ orderStatus: "approved" })}
          >
            <CheckCircle size={13} strokeWidth={1.75} />
            Duyệt
          </Button>
        )}

        {/* "completed" là dữ liệu cũ (trước khi sửa logic đọc CSV) — không còn nút bấm tay,
            vì phân loại đúng (approved/cancelled) chỉ có được khi re-import lại đúng file CSV gốc. */}
        {orderStatus === "completed" && (
          <span className="text-[11px] font-medium text-gray-400 italic">Re-import CSV để cập nhật</span>
        )}

        {/* Clawback (approved → clawback) — chỉ khi chưa trả tiền khách */}
        {orderStatus === "approved" && !showClawbackConfirm && (
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => setShowClawbackConfirm(true)}
            title="Shopee đòi lại hoa hồng — đơn này bị clawback"
          >
            <AlertTriangle size={13} strokeWidth={1.75} />
            Clawback
          </Button>
        )}

        {/* Xác nhận clawback */}
        {orderStatus === "approved" && showClawbackConfirm && (
          <div className="flex items-center gap-xs">
            <span className="text-[11px] text-red-600 font-bold">Xác nhận?</span>
            <Button
              variant="primary"
              size="sm"
              disabled={loading}
              onClick={() => {
                setShowClawbackConfirm(false);
                patch({ orderStatus: "clawback" });
              }}
            >
              Đồng ý
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => setShowClawbackConfirm(false)}
            >
              Huỷ
            </Button>
          </div>
        )}

        {/* Cancelled */}
        {orderStatus === "cancelled" && (
          <span className="text-[11px] font-bold text-gray-400">Đã huỷ</span>
        )}
      </div>
    </div>
  );
}
