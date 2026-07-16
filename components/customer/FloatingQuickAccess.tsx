"use client";

import { useState } from "react";
import Link from "next/link";
import { X, MessagesSquare, Headphones, Bell } from "lucide-react";
import { SupportInfoGrid } from "./SupportInfoGrid";

export function FloatingQuickAccess({ unreadCount }: { unreadCount: number }) {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      {/* Nút nổi cố định — luôn hiện trên mọi trang trong /app.
          Nâng lên trên bottom nav mobile (nav ~58px + safe-area), giữ nguyên vị trí ở desktop. */}
      <div className="fixed right-lg z-40 flex flex-col items-center gap-sm bottom-[calc(58px+env(safe-area-inset-bottom)+16px)] md:bottom-lg">
        <button
          onClick={() => setShowSupport(true)}
          title="Liên hệ hỗ trợ"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105 active:scale-95"
        >
          <Headphones size={24} strokeWidth={2.25} className="text-[#e86a33]" />
        </button>

        <Link
          href="/app/notifications"
          title="Thông báo"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105 active:scale-95"
        >
          <Bell size={24} strokeWidth={2.25} className="text-[#e86a33]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-negative px-1 text-[11px] font-bold text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Popup Hỗ trợ nhanh */}
      {showSupport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-md"
          onClick={() => setShowSupport(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-xl py-lg border-b border-gray-100 bg-white rounded-t-3xl"
              style={{ background: "linear-gradient(135deg,#fff3ee,#fde8d8)" }}>
              <div className="flex items-center gap-sm">
                <img src="/heoQA.png" alt="" className="h-10 w-10 object-contain" />
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

            <div className="p-xl flex flex-col gap-lg">
              <Link
                href="/app/notifications"
                onClick={() => setShowSupport(false)}
                className="flex items-center gap-md rounded-2xl bg-[#fff0e6] p-lg ring-1 ring-[#e86a33]/20 transition-colors hover:bg-[#ffe4d3]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e86a33] text-white shadow-md shadow-[#e86a33]/25">
                  <MessagesSquare size={18} strokeWidth={2.25} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Nhắn tin với cộng đồng</div>
                  <div className="text-[12px] text-gray-500">Trò chuyện trực tiếp cùng đội ngũ Ví Heo và các thành viên khác</div>
                </div>
              </Link>

              <SupportInfoGrid />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
