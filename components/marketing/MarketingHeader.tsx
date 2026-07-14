"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Cửa hàng", href: "/cua-hang" },
  { label: "Hướng dẫn", href: "/huong-dan" },
  { label: "FAQ", href: "/faq" },
];

export function MarketingHeader({ activePath = "/" }: { activePath?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#FFE4D6] shadow-sm">
      <nav className="flex justify-between items-center w-full px-5 md:px-10 py-0 max-w-[1200px] mx-auto h-16">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <img
            src="/anhlogo.png"
            alt="Lvi Hoàn Tiền logo"
            className="w-8 h-8 object-contain rounded-full"
          />
          <span
            className="font-bold text-[#FF6B35] text-[18px] leading-tight"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Lvi Hoàn Tiền
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div
          className="hidden md:flex items-center gap-7"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activePath === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-[15px] font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35] pb-0.5"
                    : "text-gray-500 hover:text-[#FF6B35]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── CTA + Hamburger ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="bg-[#FF6B35] text-white rounded-full px-5 py-2 font-bold text-[14px] hover:bg-[#e85a25] shadow-md transition-all duration-200 active:scale-95"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Mở web app 🎀
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            className="flex md:hidden flex-col justify-center items-center w-9 h-9 rounded-full bg-[#FFF3EE] hover:bg-[#FFE4D6] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-4 h-0.5 bg-[#FF6B35] rounded-full transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`block w-4 h-0.5 bg-[#FF6B35] rounded-full my-1 transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-4 h-0.5 bg-[#FF6B35] rounded-full transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile Dropdown Menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-[#FFE4D6] ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activePath === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-[15px] font-semibold py-2.5 px-3 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? "text-[#FF6B35] bg-[#FFF3EE]"
                    : "text-gray-500 hover:text-[#FF6B35] hover:bg-[#FFF3EE]"
                }`}
              >
                {isActive ? "✨ " : ""}{label}
              </Link>
            );
          })}

          <div className="mt-2 pt-3 border-t border-[#FFE4D6]">
            <Link
              href="/app"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center bg-[#FF6B35] text-white rounded-full px-5 py-2.5 font-bold text-[14px] hover:bg-[#e85a25] shadow-md transition-all duration-200"
            >
              Mở web app 🎀
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
