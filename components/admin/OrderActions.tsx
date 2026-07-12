"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle, UserPlus } from "lucide-react";

type Option = { id: string; label: string };

export function OrderActions({
  orderId,
  orderStatus,
  hasCustomer,
  customers,
}: {
  orderId: string;
  orderStatus: string;
  hasCustomer: boolean;
  customers: Option[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-xs">
      {!hasCustomer && (
        <>
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
        </>
      )}
      {orderStatus !== "approved" && (
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
    </div>
  );
}
