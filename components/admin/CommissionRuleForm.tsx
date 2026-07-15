"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

export function CommissionRuleForm({
  taxRate = 10.98,
  customerRate,
  systemRate,
  referralRate = 5,
  maxReferralOrders = 5,
  referralValidityMonths = 6
}: {
  taxRate?: number;
  customerRate: number;
  systemRate: number;
  referralRate?: number;
  maxReferralOrders?: number;
  referralValidityMonths?: number;
}) {
  const router = useRouter();
  const [tax, setTax] = useState(taxRate);
  const [customer, setCustomer] = useState(customerRate);
  const [system, setSystem] = useState(systemRate);
  const [referral, setReferral] = useState(referralRate);
  const [maxOrders, setMaxOrders] = useState(maxReferralOrders);
  const [validMonths, setValidMonths] = useState(referralValidityMonths);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/settings/commission-rule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxRate: Number(tax),
        customerRate: Number(customer),
        systemRate: Number(system),
        referralRate: Number(referral) / 100,
        maxReferralOrders: Number(maxOrders),
        referralValidityMonths: Number(validMonths),
      }),
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-md">
        <label className="text-[14px] font-semibold text-amber-900">Thuế thu nhập khấu trừ (%)</label>
        <TextInput
          type="number"
          value={tax}
          onChange={(e) => setTax(Number(e.target.value))}
          className="mt-sm max-w-[200px]"
          step="0.01"
        />
        <p className="mt-sm text-[12px] text-amber-800">
          Shopee/TikTok trừ thuế trên hoa hồng gộp trước khi đối soát. Số tiền trả khách sẽ được tính trên phần hoa hồng đã trừ thuế này, không phải trên hoa hồng ghi nhận ban đầu.
        </p>
      </div>

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

      <div className="mt-md border-t border-gray-100 pt-md">
        <h3 className="text-[14px] font-semibold mb-sm">Cấu hình Hoa hồng giới thiệu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
          <div>
            <label className="text-[13px] text-gray-600">Tỷ lệ chia (%)</label>
            <TextInput
              type="number"
              value={referral}
              onChange={(e) => setReferral(Number(e.target.value))}
              className="mt-xs text-[14px]"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-[13px] text-gray-600">Giới hạn số đơn (Max)</label>
            <TextInput
              type="number"
              value={maxOrders}
              onChange={(e) => setMaxOrders(Number(e.target.value))}
              className="mt-xs text-[14px]"
            />
          </div>
          <div>
            <label className="text-[13px] text-gray-600">Thời hạn áp dụng (Tháng)</label>
            <TextInput
              type="number"
              value={validMonths}
              onChange={(e) => setValidMonths(Number(e.target.value))}
              className="mt-xs text-[14px]"
            />
          </div>
        </div>
        <p className="mt-sm text-[12px] text-gray-500">
          Người giới thiệu sẽ nhận được {referral}% từ {maxOrders} đơn hàng đầu tiên của bạn bè (F1), miễn là các đơn hàng này phát sinh trong vòng {validMonths} tháng kể từ khi F1 đăng ký tài khoản.
        </p>
      </div>
      
      {error && <div className="text-[14px] text-red-500">{error}</div>}
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Đang lưu..." : "Lưu cấu hình"}
      </Button>
    </form>
  );
}
