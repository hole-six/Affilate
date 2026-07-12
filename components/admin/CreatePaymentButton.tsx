"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";

export function CreatePaymentButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, periodLabel: new Date().toLocaleDateString("vi-VN") }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="primary" size="sm" disabled={loading} onClick={create}>
      <Send size={13} strokeWidth={1.75} />
      {loading ? "Đang tạo..." : "Tạo phiếu"}
    </Button>
  );
}
