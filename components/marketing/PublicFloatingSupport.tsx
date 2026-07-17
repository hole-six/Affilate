"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Headphones } from "lucide-react";
import { SupportInfoGrid } from "@/components/customer/SupportInfoGrid";

/**
 * Bản công khai của nút hỗ trợ nổi trong dashboard khách hàng — dùng cho các
 * trang công khai (trang chủ...) để khách vãng lai cũng thấy được thông tin
 * liên hệ/mạng xã hội mà không cần đăng nhập. Bỏ chuông thông báo và link
 * "/app/notifications" vì không áp dụng cho người chưa đăng nhập.
 */
export function PublicFloatingSupport() {
  const [showSupport, setShowSupport] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="fixed right-lg bottom-lg z-40">
        <button
          onClick={() => setShowSupport(true)}
          title="Liên hệ hỗ trợ"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105 active:scale-95"
        >
          <Headphones size={24} strokeWidth={2.25} className="text-[#e86a33]" />
        </button>
      </div>

      {showSupport &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-md"
            onClick={() => setShowSupport(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-xl py-lg border-b border-gray-100 bg-white rounded-t-3xl"
                style={{ background: "linear-gradient(135deg,#fff3ee,#fde8d8)" }}
              >
                <div className="flex items-center gap-sm">
                  <img src="/heoQA.png" alt="Hỗ trợ khách hàng iviback" className="h-10 w-10 object-contain" />
                  <div>
                    <h3 className="text-[16px] font-black text-gray-900">Hỗ trợ nhanh</h3>
                    <p className="text-[12px] text-gray-500">Liên hệ với Ví Heo qua các kênh dưới đây</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSupport(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-gray-500 hover:bg-white hover:text-gray-900 transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-xl">
                <SupportInfoGrid />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
