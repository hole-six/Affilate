"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Power, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TextInput } from "@/components/ui/TextInput";

type Props = {
  platformStatus: string;
  config: {
    baseUrl: string;
    hasApiKey: boolean;
    creatorUsername: string | null;
    hasCreatorUsername: boolean;
    hasSigningSecret: boolean;
    readyForLinks: boolean;
    readyForWebhook: boolean;
  };
};

export function TikTokIntegrationPanel({ platformStatus, config }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [updateTimeStart, setUpdateTimeStart] = useState("");
  const [updateTimeEnd, setUpdateTimeEnd] = useState("");
  const [orderId, setOrderId] = useState("");
  const active = platformStatus === "active";

  async function togglePlatform() {
    setLoading("toggle");
    setMessage(null);
    const res = await fetch("/api/admin/platforms/TIKTOK", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: active ? "inactive" : "active" }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    setMessage(res.ok ? (active ? "Da tam tat TikTok Shop." : "Da bat TikTok Shop.") : data.error ?? "Khong cap nhat duoc nen tang");
    if (res.ok) router.refresh();
  }

  async function testConnection() {
    setLoading("test");
    setMessage(null);
    const res = await fetch("/api/admin/integrations/tiktok/test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    setMessage(res.ok ? `Ket noi RioHub OK. Creator ${data.creatorUsername}, ${data.total ?? 0} link.` : data.error ?? "Test that bai");
  }

  async function syncOrders() {
    setLoading("sync");
    setMessage(null);
    const res = await fetch("/api/admin/integrations/tiktok/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeStart: timeStart || null,
        timeEnd: timeEnd || null,
        updateTimeStart: updateTimeStart || null,
        updateTimeEnd: updateTimeEnd || null,
        orderId: orderId || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    if (!res.ok) {
      setMessage(data.error ?? "Dong bo that bai");
      return;
    }
    const r = data.result;
    setMessage(`Dong bo xong: ${r.processed} don, tao moi ${r.created}, cap nhat ${r.updated}, approved ${r.approved}, chua map ${r.unmapped}.`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-lg">
          <div className="mb-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-sm">
              <Power size={16} className="text-gray-500" />
              <div className="text-[14px] font-bold text-gray-900">Nen tang TikTok Shop</div>
            </div>
            <Badge tone={active ? "positive" : "warning"} dot>
              {active ? "Dang bat" : "Tam tat"}
            </Badge>
          </div>
          <p className="mb-md text-[13px] leading-relaxed text-gray-500">
            Khi tam tat, TikTok se an khoi man tao link va API se tu choi tao link TikTok moi.
          </p>
          <Button type="button" variant={active ? "danger" : "primary"} onClick={togglePlatform} disabled={loading === "toggle"}>
            <Power size={16} />
            {active ? "Tam tat TikTok" : "Bat TikTok"}
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-100 p-lg">
          <div className="mb-md flex items-center gap-sm">
            <ShieldCheck size={16} className="text-gray-500" />
            <div className="text-[14px] font-bold text-gray-900">Cau hinh RioHub</div>
          </div>
          <div className="grid grid-cols-2 gap-sm text-[12px]">
            <Status label="API key" ok={config.hasApiKey} />
            <Status label="Creator" ok={config.hasCreatorUsername} />
            <Status label="Webhook secret" ok={config.hasSigningSecret} />
            <Status label="Tao link" ok={config.readyForLinks} />
          </div>
          <div className="mt-md rounded-xl bg-gray-50 p-sm text-[12px] text-gray-500">
            <div>Base URL: <span className="font-mono">{config.baseUrl}</span></div>
            <div>Creator: <span className="font-mono">{config.creatorUsername ?? "chua cau hinh"}</span></div>
          </div>
          <Button type="button" variant="secondary" className="mt-md" onClick={testConnection} disabled={loading === "test"}>
            <Activity size={16} />
            Kiem tra ket noi
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-lg">
        <div className="mb-md flex items-center gap-sm">
          <RefreshCw size={16} className="text-gray-500" />
          <div className="text-[14px] font-bold text-gray-900">Dong bo don TikTok</div>
        </div>
        <div className="grid grid-cols-1 gap-md md:grid-cols-4">
          <TextInput placeholder="time_start" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
          <TextInput placeholder="time_end" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
          <TextInput placeholder="update_time_start" value={updateTimeStart} onChange={(e) => setUpdateTimeStart(e.target.value)} />
          <TextInput placeholder="update_time_end" value={updateTimeEnd} onChange={(e) => setUpdateTimeEnd(e.target.value)} />
        </div>
        <div className="mt-md">
          <TextInput
            placeholder="order_id TikTok, ngan cach dau phay neu nhieu don"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </div>
        <div className="mt-md flex items-center gap-md">
          <Button type="button" onClick={syncOrders} disabled={loading === "sync"}>
            <RefreshCw size={16} />
            Dong bo ngay
          </Button>
          <p className="text-[12px] text-gray-500">
            File TikTok dashboard khong co tracking/sub2, chi dung de copy ID don hang. He thong se keo qua RioHub de map khach.
          </p>
        </div>
      </div>

      {message && <div className="rounded-xl bg-gray-50 p-md text-[13px] font-medium text-gray-700">{message}</div>}
    </div>
  );
}

function Status({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-sm py-xs">
      <span className="text-gray-500">{label}</span>
      <span className={ok ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>{ok ? "OK" : "Thieu"}</span>
    </div>
  );
}
