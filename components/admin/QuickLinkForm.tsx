"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, CheckCircle2, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

type Option = { id: string; label: string };
type LinkResult = {
  shortUrl: string;
  generatedLink: string;
  trackingCode: string;
  shortCode: string;
};

export function QuickLinkForm({
  customers,
  platforms,
}: {
  customers: Option[];
  platforms: Option[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [channelSource, setChannelSource] = useState<"web" | "zalo" | "telegram">("web");
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl, platformId, customerId, channelSource }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không tạo được link");
      return;
    }

    const data = await res.json();
    setResult({
      shortUrl: data.link.shortUrl,
      generatedLink: data.link.generatedLink,
      trackingCode: data.link.trackingCode,
      shortCode: data.link.shortCode,
    });
    setOriginalUrl("");
    router.refresh();
  }

  function copyLink() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="border border-gray-100 bg-white shadow-sm overflow-hidden p-0">
      <div className="flex flex-col lg:flex-row">
        {/* Left Column: Form */}
        <div className="flex-1 p-md sm:p-lg lg:p-2xl border-b lg:border-b-0 lg:border-r border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">
                Link gốc từ Shopee / TikTok *
              </label>
              <TextInput
                placeholder="https://shopee.vn/..."
                required
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="bg-gray-50 h-12"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">
                  Khách hàng
                </label>
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-12 bg-gray-50">
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">
                  Nền tảng
                </label>
                <Select value={platformId} onChange={(e) => setPlatformId(e.target.value)} className="h-12 bg-gray-50">
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">
                Kênh phân phối
              </label>
              <Select
                value={channelSource}
                onChange={(e) => setChannelSource(e.target.value as "web" | "zalo" | "telegram")}
                className="h-12 bg-gray-50"
              >
                <option value="web">Website</option>
                <option value="zalo">Zalo OA</option>
                <option value="telegram">Telegram Bot</option>
              </Select>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-sm text-[13px] text-red-600 font-medium">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading || !customerId || !platformId} size="lg" className="w-full mt-sm text-[15px] shadow-sm shadow-[#e86a33]/20">
              {loading ? (
                <span className="flex items-center justify-center gap-sm">
                  <RefreshCw size={18} className="animate-spin" />
                  Đang khởi tạo...
                </span>
              ) : (
                "Tạo Short Link Affiliate"
              )}
            </Button>
          </form>
        </div>

        {/* Right Column: Result */}
        <div className="lg:w-[400px] bg-gray-50/50 p-md sm:p-lg lg:p-2xl flex flex-col items-center justify-center text-center">
          {!result ? (
            <div className="flex flex-col items-center gap-md opacity-40">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                <LinkIcon size={24} className="text-gray-500" />
              </div>
              <p className="text-[14px] font-medium text-gray-600 max-w-[200px]">
                Hoàn thành biểu mẫu để tạo Link Affiliate mới.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-lg shadow-sm">
                <CheckCircle2 size={32} strokeWidth={2} />
              </div>
              
              <h4 className="text-[16px] font-bold text-gray-900 mb-xl">Khởi tạo thành công!</h4>
              
              <div className="w-full bg-white rounded-xl p-lg border border-gray-100 shadow-sm mb-lg text-left relative group">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Short Link</div>
                <div className="text-[16px] font-bold text-[#e86a33] break-all pr-8">
                  {result.shortUrl}
                </div>
                <button 
                  onClick={copyLink}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#e86a33] hover:bg-[#fff0e6] rounded-md transition-colors"
                  title="Copy link"
                >
                  <Copy size={18} />
                </button>
              </div>

              <div className="w-full flex flex-col gap-sm text-left">
                <div className="flex items-center justify-between bg-white rounded-lg px-md py-sm border border-gray-100">
                  <span className="text-[12px] font-medium text-gray-500">Tracking Code</span>
                  <span className="text-[13px] font-mono font-bold text-gray-900">{result.trackingCode}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg px-md py-sm border border-gray-100">
                  <span className="text-[12px] font-medium text-gray-500">Short Code</span>
                  <span className="text-[13px] font-mono font-bold text-gray-900">{result.shortCode}</span>
                </div>
              </div>

              {result.shortUrl.includes("localhost") && (
                <div className="mt-xl text-[12px] text-red-500 bg-red-50 p-sm rounded-lg text-center font-medium">
                  Lưu ý: Link này đang dùng localhost, chỉ mở được trên máy tính của bạn.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
