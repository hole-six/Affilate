"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

export function CommissionRuleForm({ customerRate, systemRate }: { customerRate: number; systemRate: number }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(customerRate);
  const [system, setSystem] = useState(systemRate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/settings/commission-rule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerRate: Number(customer), systemRate: Number(system) }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không lưu được");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-lg">
      <div className="grid grid-cols-2 gap-lg">
        <div>
          <label className="text-[14px] font-semibold">Tỷ lệ khách hàng nhận (%)</label>
          <TextInput
            type="number"
            value={customer}
            onChange={(e) => setCustomer(Number(e.target.value))}
            className="mt-sm"
          />
        </div>
        <div>
          <label className="text-[14px] font-semibold">Tỷ lệ hệ thống giữ (%)</label>
          <TextInput
            type="number"
            value={system}
            onChange={(e) => setSystem(Number(e.target.value))}
            className="mt-sm"
          />
        </div>
      </div>
      {error && <div className="text-[14px] text-red-500">{error}</div>}
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Đang lưu..." : "Lưu cấu hình"}
      </Button>
    </form>
  );
}
