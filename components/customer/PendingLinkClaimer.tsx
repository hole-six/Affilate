"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

const PENDING_LINK_STORAGE_KEY = "iviback_pending_link";

// Khách xem thử link ở trang chủ (chưa đăng nhập) → lưu URL gốc vào
// localStorage → đăng ký xong, lần đầu vào /app/** thì component này tự
// đọc lại và tạo link THẬT (có session) cho đúng tài khoản mới, không bắt
// khách phải dán link lại lần 2. Chạy 1 lần duy nhất khi vào layout khách,
// dùng chung cho cả đăng ký thường lẫn Google OAuth (cả 2 đều redirect về
// đây sau khi có session).
export function PendingLinkClaimer() {
  const router = useRouter();
  const [claimedMessage, setClaimedMessage] = useState<string | null>(null);

  useEffect(() => {
    let pendingUrl: string | null = null;
    try {
      pendingUrl = localStorage.getItem(PENDING_LINK_STORAGE_KEY);
    } catch {
      return;
    }
    if (!pendingUrl) return;

    // Xoá ngay để không tạo lặp lại nếu component re-mount hoặc khách vào
    // lại trang nhiều lần trước khi request kịp hoàn tất.
    try {
      localStorage.removeItem(PENDING_LINK_STORAGE_KEY);
    } catch {}

    (async () => {
      try {
        const previewRes = await fetch("/api/links/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: pendingUrl }),
        });
        const previewData = await previewRes.json();
        if (!previewRes.ok) return;

        const createRes = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalUrl: pendingUrl,
            platformCode: previewData.platformCode,
            channelSource: "web",
          }),
        });
        if (!createRes.ok) return;

        setClaimedMessage("Đã tạo link cho sản phẩm bạn xem trước lúc đăng ký!");
        router.refresh();
      } catch {
        // Tạo link demo thất bại — không chặn hay báo lỗi cho khách, họ
        // vẫn có thể tự dán lại link ở mục Hoàn tiền bình thường.
      }
    })();
  }, [router]);

  if (!claimedMessage) return null;

  return (
    <div className="fixed bottom-lg left-1/2 z-50 flex -translate-x-1/2 items-center gap-sm rounded-2xl bg-ink px-lg py-md text-white shadow-xl fade-in">
      <CheckCircle2 size={18} className="text-primary shrink-0" />
      <span className="text-[13px] font-semibold">{claimedMessage}</span>
      <button onClick={() => setClaimedMessage(null)} className="ml-sm text-white/60 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}
