"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { CheckCircle, X } from "lucide-react";

export function MarkPaidForm({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [transferReference, setTransferReference] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [bill, setBill] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <CheckCircle size={13} strokeWidth={1.75} />
        Đã chuyển khoản
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-sm rounded-xl border border-gray-100 bg-gray-50 p-lg">
      <div className="flex items-center justify-between mb-xs">
        <span className="text-[13px] font-semibold text-gray-900">Xác nhận thanh toán</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-canvas hover:text-gray-900 transition-colors"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      </div>
      <TextInput
        placeholder="Mã giao dịch"
        value={transferReference}
        onChange={(e) => setTransferReference(e.target.value)}
      />
      <TextInput
        placeholder="Ghi chú chuyển khoản"
        value={transferNote}
        onChange={(e) => setTransferNote(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setBill(e.target.files?.[0] ?? null)}
        className="text-[12px] text-gray-500 file:mr-sm file:rounded-md file:border-0 file:bg-canvas file:px-sm file:py-xs file:text-[12px] file:font-medium file:text-body"
      />
      <div className="flex gap-sm">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Đang lưu..." : "Xác nhận"}
        </Button>
        <Button type="button" variant="tertiary" size="sm" onClick={() => setOpen(false)}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
