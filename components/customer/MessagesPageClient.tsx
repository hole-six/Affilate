"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/format";

type SupportMessage = {
  id: string;
  senderRole: "admin" | "customer";
  message: string;
  createdAt: string;
};

export function MessagesPageClient({ initialMessages }: { initialMessages: SupportMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  async function send() {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setMessages(data.thread?.messages ?? []);
      setDraft("");
    } else {
      setError(data.error ?? "Không gửi được, thử lại sau.");
    }
    setSending(false);
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-sm rounded-3xl bg-white py-3xl shadow-sm ring-1 ring-black/[0.06]">
        <MessageCircle size={40} className="text-gray-200" strokeWidth={1.5} />
        <span className="text-[14px] font-bold text-gray-400">Bạn chưa có tin nhắn nào từ Admin</span>
        <span className="text-[12px] text-gray-400">Khi Admin nhắn tin cho bạn, hội thoại sẽ hiện ở đây.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06]" style={{ height: "min(70vh, 640px)" }}>
      <div ref={listRef} className="flex-1 overflow-y-auto p-lg flex flex-col gap-sm">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderRole === "customer" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-md py-sm text-[13px] ${
                m.senderRole === "customer" ? "bg-[#e86a33] text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.message}</p>
              <p className={`mt-[2px] text-[9px] ${m.senderRole === "customer" ? "text-white/70" : "text-gray-400"}`}>
                {m.senderRole === "admin" ? "Admin — " : ""}
                {formatDate(new Date(m.createdAt))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="px-lg text-[12px] font-medium text-red-500">{error}</p>}

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
          placeholder="Trả lời Admin..."
          className="h-11 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-md text-[14px] font-medium text-gray-900 placeholder:text-gray-300 focus:border-[#e86a33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e86a33]/20 transition-all"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e86a33] text-white shadow-md shadow-[#e86a33]/25 hover:bg-[#d65d2a] transition-all disabled:opacity-50 active:scale-95"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.25} />}
        </button>
      </div>
    </div>
  );
}
