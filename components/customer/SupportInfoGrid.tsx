"use client";

import { useState } from "react";
import { Phone, Copy, Check } from "lucide-react";
import {
  FacebookIcon,
  ZaloIcon,
  YoutubeIcon,
  TiktokIcon,
  InstagramIcon,
  ThreadsIcon,
} from "@/components/icons/PlatformIcons";

const PHONE_DISPLAY = "0965.965.439";
const PHONE_RAW = "0965965439";

const CHANNELS = [
  {
    key: "facebook",
    label: "Facebook",
    handle: "Fanpage Hoàn Tiền Ví Heo",
    cta: "Nhắn tin ngay",
    href: "https://www.facebook.com/share/1BShYKizDV/?mibextid=wwXIfr",
    Icon: FacebookIcon,
  },
  {
    key: "zalo",
    label: "Zalo",
    handle: "Cộng đồng Zalo iviback",
    cta: "Tham gia ngay",
    href: "https://zalo.me/g/cgmmvw504",
    Icon: ZaloIcon,
  },
  {
    key: "youtube",
    label: "Youtube",
    handle: "@hoanphihoahongaff",
    cta: "Xem kênh ngay",
    href: "https://youtube.com/@hoanphihoahongaff?si=aNywoErGCAi7BGxV",
    Icon: YoutubeIcon,
  },
  {
    key: "tiktok",
    label: "Tiktok",
    handle: "@vi_ha790",
    cta: "Theo dõi ngay",
    href: "https://www.tiktok.com/@vi_ha790?_r=1&_t=ZS-983XgTM1aum",
    Icon: TiktokIcon,
  },
  {
    key: "instagram",
    label: "Instagram",
    handle: "@imviihaaa",
    cta: "Theo dõi ngay",
    href: "https://www.instagram.com/imviihaaa?igsh=M2RqZml1NHpzbmgx&utm_source=qr",
    Icon: InstagramIcon,
  },
  {
    key: "threads",
    label: "Threads",
    handle: "@imviihaaa",
    cta: "Theo dõi ngay",
    href: "https://www.threads.com/@imviihaaa?igshid=NTc4MTIwNjQ2YQ==",
    Icon: ThreadsIcon,
  },
];

function CopyPhoneButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(PHONE_RAW);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex h-9 flex-1 items-center justify-center gap-xs rounded-lg bg-gray-100 px-sm text-[12px] font-bold text-gray-600 transition-colors hover:bg-gray-200"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      {copied ? "Đã copy" : "Copy số"}
    </button>
  );
}

export function SupportInfoGrid() {
  return (
    <div className="flex flex-col gap-lg">
      {/* Hotline nổi bật */}
      <div
        className="flex flex-col gap-md rounded-3xl p-lg shadow-sm ring-1 ring-black/5"
        style={{ background: "linear-gradient(135deg,#fff3ee,#fde8d8)" }}
      >
        <div className="flex items-center gap-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 shadow-md shadow-emerald-500/30">
            <Phone size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#e86a33]/70">Hotline hỗ trợ</div>
            <div className="text-[20px] font-black text-gray-900 tracking-tight">{PHONE_DISPLAY}</div>
          </div>
        </div>
        <p className="text-[12px] text-gray-500">Gọi hoặc nhắn Zalo — hỗ trợ nhanh nhất trong giờ hành chính</p>
        <div className="flex items-center gap-sm">
          <CopyPhoneButton />
          <a
            href={`tel:${PHONE_RAW}`}
            className="flex h-9 flex-1 items-center justify-center gap-xs rounded-lg bg-emerald-500 text-[13px] font-bold text-white shadow-md shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.97]"
          >
            <Phone size={14} strokeWidth={2.5} /> Gọi ngay
          </a>
        </div>
      </div>

      {/* Grid các kênh mạng xã hội */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        {CHANNELS.map((c) => (
          <a
            key={c.key}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-md rounded-3xl bg-white p-lg shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="shrink-0 transition-transform group-hover:scale-110">
              <c.Icon size={44} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-gray-900">{c.label}</div>
              <div className="truncate text-[12px] text-gray-400">{c.handle}</div>
            </div>
            <div className="shrink-0 text-[12px] font-bold text-[#e86a33] opacity-0 transition-opacity group-hover:opacity-100">
              {c.cta} →
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
