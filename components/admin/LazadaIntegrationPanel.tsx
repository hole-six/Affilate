"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Power, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Props = {
  platformStatus: string;
  config: {
    baseUrl: string;
    hasAppKey: boolean;
    hasAppSecret: boolean;
    hasAccessToken: boolean;
    ready: boolean;
  };
};

export function LazadaIntegrationPanel({ platformStatus, config }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const active = platformStatus === "active";

  async function togglePlatform() {
    setLoading("toggle");
    setMessage(null);
    const res = await fetch("/api/admin/platforms/LAZADA", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: active ? "inactive" : "active" }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    setMessage(res.ok ? (active ? "Đã tạm tắt Lazada." : "Đã bật Lazada.") : data.error ?? "Không cập nhật được nền tảng");
    if (res.ok) router.refresh();
  }

  async function testConnection() {
    setLoading("test");
    setMessage(null);
    const res = await fetch("/api/admin/integrations/lazada/test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    setMessage(res.ok ? `Kết nối Lazada OK. ${data.total ?? 0} đơn hôm nay.` : data.error ?? "Test thất bại");
  }

  async function syncOrders() {
    setLoading("sync");
    setMessage(null);
    const res = await fetch("/api/admin/integrations/lazada/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    if (!res.ok) {
      setMessage(data.error ?? "Đồng bộ thất bại");
      return;
    }
    const r = data.result;
    setMessage(`Đồng bộ xong: ${r.processed} đơn, tạo mới ${r.created}, cập nhật ${r.updated}, approved ${r.approved}, chưa map ${r.unmapped}.`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-lg">
          <div className="mb-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-sm">
              <Power size={16} className="text-gray-500" />
              <div className="text-[14px] font-bold text-gray-900">Nền tảng Lazada</div>
            </div>
            <Badge tone={active ? "positive" : "warning"} dot>
              {active ? "Đang bật" : "Tạm tắt"}
            </Badge>
          </div>
          <p className="mb-md text-[13px] leading-relaxed text-gray-500">
            Khi tạm tắt, Lazada sẽ ẩn khỏi màn tạo link và API sẽ từ chối tạo link Lazada mới.
          </p>
          <Button type="button" variant={active ? "danger" : "primary"} onClick={togglePlatform} disabled={loading === "toggle"}>
            <Power size={16} />
            {active ? "Tạm tắt Lazada" : "Bật Lazada"}
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-100 p-lg">
          <div className="mb-md flex items-center gap-sm">
            <Activity size={16} className="text-gray-500" />
            <div className="text-[14px] font-bold text-gray-900">Cấu hình Lazada Open API</div>
          </div>
          <div className="grid grid-cols-2 gap-sm text-[12px]">
            <Status label="App key" ok={config.hasAppKey} />
            <Status label="App secret" ok={config.hasAppSecret} />
            <Status label="Access token" ok={config.hasAccessToken} />
            <Status label="Sẵn sàng" ok={config.ready} />
          </div>
          <div className="mt-md rounded-xl bg-gray-50 p-sm text-[12px] text-gray-500">
            <div>Base URL: <span className="font-mono">{config.baseUrl}</span></div>
          </div>
          <Button type="button" variant="secondary" className="mt-md" onClick={testConnection} disabled={loading === "test"}>
            <Activity size={16} />
            Kiểm tra kết nối
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-lg">
        <div className="mb-md flex items-center gap-sm">
          <RefreshCw size={16} className="text-gray-500" />
          <div className="text-[14px] font-bold text-gray-900">Đồng bộ đơn Lazada</div>
        </div>
        <div className="flex items-center gap-md">
          <Button type="button" onClick={syncOrders} disabled={loading === "sync"}>
            <RefreshCw size={16} />
            Đồng bộ ngay
          </Button>
          <p className="text-[12px] text-gray-500">
            Quét 30 ngày gần nhất qua Lazada Conversion Report, map đúng khách theo subId đã gắn khi tạo link.
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
      <span className={ok ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>{ok ? "OK" : "Thiếu"}</span>
    </div>
  );
}
