"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

const TYPE_STYLE: Record<string, { bg: string; ring: string }> = {
  order_approved: { bg: "bg-emerald-50", ring: "ring-emerald-100" },
  payment_paid: { bg: "bg-sky-50", ring: "ring-sky-100" },
  referral_bonus: { bg: "bg-purple-50", ring: "ring-purple-100" },
  broadcast: { bg: "bg-[#fff0e6]", ring: "ring-[#e86a33]/20" },
  system: { bg: "bg-gray-50", ring: "ring-gray-100" },
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
  initialTotalPages,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
  initialTotalPages: number;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loadingMore, setLoadingMore] = useState(false);

  async function markRead(n: Notification) {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
    }
    if (n.link) router.push(n.link);
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
  }

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await fetch(`/api/notifications?page=${nextPage}`);
    if (res.ok) {
      const data = await res.json();
      setNotifications((prev) => [...prev, ...data.notifications]);
      setPage(nextPage);
      setTotalPages(data.totalPages);
    }
    setLoadingMore(false);
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-gray-500">
          {unreadCount > 0 ? (
            <span>
              Bạn có <span className="font-bold text-[#e86a33]">{unreadCount}</span> thông báo chưa đọc
            </span>
          ) : (
            "Bạn đã xem hết thông báo"
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-xs rounded-lg bg-gray-100 px-md py-[6px] text-[12px] font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            <CheckCheck size={13} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-sm rounded-3xl bg-white py-3xl shadow-sm ring-1 ring-black/5">
          <img src="/heochodoi.png" alt="" className="h-16 w-16 object-contain opacity-70" />
          <span className="text-[14px] font-bold text-gray-400">Chưa có thông báo nào</span>
        </div>
      ) : (
        <div className="flex flex-col gap-sm">
          {notifications.map((n) => {
            const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.system;
            return (
              <button
                key={n.id}
                onClick={() => markRead(n)}
                className={`flex items-start gap-md rounded-2xl p-lg text-left shadow-sm ring-1 transition-all hover:-translate-y-[1px] hover:shadow-md ${
                  n.isRead ? "bg-white ring-black/5" : `${style.bg} ${style.ring}`
                }`}
              >
                {!n.isRead && <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-[#e86a33]" />}
                <div className={`min-w-0 flex-1 ${n.isRead ? "ml-[16px]" : ""}`}>
                  <div className="flex items-center justify-between gap-md">
                    <span className={`text-[14px] ${n.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}>
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-gray-400">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-gray-500 leading-relaxed">{n.message}</p>
                </div>
              </button>
            );
          })}
          {page < totalPages && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mx-auto mt-sm rounded-xl border border-gray-200 bg-white px-lg py-sm text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Đang tải..." : "Tải thêm thông báo cũ hơn"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
