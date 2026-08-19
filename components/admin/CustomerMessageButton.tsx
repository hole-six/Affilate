"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/format";

type SupportMessage = {
  id: string;
  senderRole: "admin" | "customer";
  message: string;
  createdAt: string;
};

type Thread = {
  id: string;
  adminUnreadCount: number;
  messages: SupportMessage[];
} | null;

export function CustomerMessageButton({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<Thread>(null);
  const [unreadBadge, setUnreadBadge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Chỉ xem số chưa đọc để hiện badge trên nút — không đánh dấu đã đọc
  // (mark-read chỉ xảy ra khi admin thực sự mở panel ra xem).
  useEffect(() => {
    fetch(`/api/admin/support-threads/${customerId}`)
      .then((r) => r.json())
      .then((d) => setUnreadBadge(d.thread?.adminUnreadCount ?? 0))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  async function openPanel() {
    setOpen(true);
    setLoading(true);
    const res = await fetch(`/api/admin/support-threads/${customerId}`);
    const data = await res.json();
    setThread(data.thread);
    setLoading(false);
    setUnreadBadge(0);
    if (data.thread?.adminUnreadCount > 0) {
      fetch(`/api/admin/support-threads/${customerId}`, { method: "PATCH" }).catch(() => {});
    }
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));
  }

  async function send() {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const res = await fetch(`/api/admin/support-threads/${customerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });
    if (res.ok) {
      const data = await res.json();
      setThread(data.thread);
      setDraft("");
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
    }
    setSending(false);
  }

  return (
    <>
      <button
        onClick={openPanel}
        title="Nhắn tin cho khách"
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
      >
        <MessageCircle size={14} strokeWidth={2.25} />
        {unreadBadge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-negative px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadBadge > 9 ? "9+" : unreadBadge}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl fade-in"
            style={{ maxHeight: "80vh" }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-xl py-lg">
              <div className="flex items-center gap-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <MessageCircle size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-gray-900">Nhắn tin: {customerName}</h3>
                  <p className="text-[11px] text-gray-400">Chỉ khách này thấy được hội thoại</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-lg flex flex-col gap-sm min-h-[240px]">
              {loading ? (
                <p className="text-center text-[12px] text-gray-400">Đang tải...</p>
              ) : !thread || thread.messages.length === 0 ? (
                <p className="text-center text-[12px] text-gray-400">Chưa có tin nhắn nào — gửi tin đầu tiên bên dưới.</p>
              ) : (
                thread.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-md py-sm text-[13px] ${
                        m.senderRole === "admin" ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.message}</p>
                      <p className={`mt-[2px] text-[9px] ${m.senderRole === "admin" ? "text-sky-100" : "text-gray-400"}`}>
                        {formatDate(new Date(m.createdAt))}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-sm border-t border-gray-100 p-md">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="h-11 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-md text-[14px] font-medium text-gray-900 placeholder:text-gray-300 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
              />
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-200 hover:bg-sky-600 transition-all disabled:opacity-50 active:scale-95"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.25} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
