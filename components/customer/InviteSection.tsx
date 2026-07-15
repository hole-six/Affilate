"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2, QrCode, X } from "lucide-react";
import { Star } from "lucide-react";

type Props = {
  customerCode: string;
  qrDataUrl: string; // generated server-side
};

export function InviteSection({ customerCode, qrDataUrl }: Props) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    setInviteUrl(`${window.location.origin}/register?ref=${customerCode}`);
  }, [customerCode]);

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/[0.06] flex-1 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="mb-md flex items-center gap-sm">
        <img src="/heoquatang.png" alt="" className="h-9 w-9 object-contain" />
        <h2 className="text-[15px] font-bold text-gray-900">Giới thiệu bạn bè</h2>
      </div>

      <p className="text-[13px] text-gray-400 mb-md leading-relaxed">
        Mời bạn bè tham gia và nhận{" "}
        <span className="font-bold text-[#e86a33]">10% hoa hồng</span> từ đơn
        hàng của họ mãi mãi!
      </p>

      {/* Stars + badge */}
      <div className="flex items-center gap-1 mb-lg">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
        ))}
        <span className="text-[11px] text-gray-400 ml-1">20% hoa hồng đơn đầu</span>
      </div>

      {/* Link display */}
      {inviteUrl && (
        <div className="mb-md flex items-center gap-sm rounded-2xl bg-orange-50 border border-orange-100 p-sm">
          <span className="flex-1 truncate text-[12px] font-medium text-gray-500 px-sm">
            {inviteUrl}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-sm">
        {/* Copy link */}
        <button
          onClick={handleCopy}
          className={`flex flex-1 items-center justify-center gap-xs rounded-2xl py-[10px] text-[13px] font-bold transition-all active:scale-[0.97] ${
            copied
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-[#e86a33] text-white shadow-md shadow-[#e86a33]/30 hover:bg-[#d65d2a]"
          }`}
        >
          {copied ? (
            <>
              <Check size={15} strokeWidth={2.5} />
              Đã sao chép!
            </>
          ) : (
            <>
              <Copy size={15} strokeWidth={2} />
              Copy link
            </>
          )}
        </button>

        {/* QR Code button */}
        <button
          onClick={() => setShowQR(true)}
          className="flex items-center justify-center gap-xs rounded-2xl bg-orange-100 px-lg py-[10px] text-[13px] font-bold text-[#e86a33] hover:bg-orange-200 transition-all active:scale-[0.97]"
          title="Xem mã QR"
        >
          <QrCode size={17} strokeWidth={2} />
          QR
        </button>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-md"
          onClick={() => setShowQR(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-white shadow-2xl fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="relative overflow-hidden p-xl text-center"
              style={{
                background:
                  "linear-gradient(135deg, #fff3ee 0%, #fde8d8 100%)",
              }}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute right-md top-md flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
              <img
                src="/heoqua.png"
                alt=""
                className="mx-auto h-16 w-16 object-contain mb-sm"
              />
              <h3 className="text-[17px] font-black text-gray-900">
                Mã QR giới thiệu
              </h3>
              <p className="text-[12px] text-gray-400 mt-1">
                Cho bạn bè quét để đăng ký ngay
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center p-xl gap-md">
              <div className="p-md rounded-2xl bg-white shadow-inner ring-1 ring-gray-100">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code giới thiệu"
                    className="h-44 w-44 object-contain"
                  />
                ) : (
                  <div className="h-44 w-44 flex items-center justify-center text-gray-300">
                    <QrCode size={80} strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Invite URL below QR */}
              <div className="w-full rounded-xl bg-gray-50 px-md py-sm text-center">
                <p className="text-[11px] text-gray-400 mb-[2px]">Link giới thiệu của bạn</p>
                <p className="text-[12px] font-semibold text-gray-600 break-all">
                  {inviteUrl}
                </p>
              </div>

              {/* Copy in modal */}
              <button
                onClick={handleCopy}
                className={`w-full flex items-center justify-center gap-sm rounded-2xl py-[11px] text-[14px] font-bold transition-all ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-[#e86a33] text-white hover:bg-[#d65d2a]"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy size={16} strokeWidth={2} />
                    Sao chép link
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                ⭐ Bạn nhận{" "}
                <span className="font-bold text-[#e86a33]">20% hoa hồng</span>{" "}
                từ đơn đầu tiên của họ
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
