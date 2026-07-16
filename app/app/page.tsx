import { redirect } from "next/navigation";
import {
  Clock,
  Wallet,
  Package,
  ArrowUpRight,
  Link2,
  ShoppingBag,
  ChevronRight,
  Star,
  Store,
  Music2,
} from "lucide-react";
import QRCode from "qrcode";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { InviteSection } from "@/components/customer/InviteSection";

// Platform color map để hiển thị ảnh placeholder
const PLATFORM_STYLE: Record<string, { color: string }> = {
  SHOPEE: { color: "#ee4d2d" },
  TIKTOK: { color: "#000000" },
  LAZADA: { color: "#0f146d" },
  TIKI: { color: "#1a73e8" },
};

export default async function CustomerHomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin" || !session.customerId) redirect("/admin");

  const [customer, activeRule] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.customerId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 6,
          include: {
            trackingLink: { select: { productImage: true, productTitle: true } },
            platform: { select: { code: true, name: true } },
          },
        },
        trackingLinks: { orderBy: { createdAt: "desc" }, take: 3 },
      },
    }),
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const allOrders = customer?.orders ?? [];
  const totalIncome = allOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const pendingIncome = allOrders
    .filter((o) => o.orderStatus === "pending")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const availableBalance = allOrders
    .filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const paidTotal = allOrders
    .filter((o) => o.payoutStatus === "paid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  const firstName = (customer?.fullName ?? session.fullName).split(" ").at(-1) ?? "bạn";
  const customerCode = customer?.customerCode ?? "";
  const referralRate = activeRule?.referralRate ? Number(activeRule.referralRate) : 0.05;
  const maxReferralOrders = activeRule?.maxReferralOrders ?? 5;
  const referralValidityMonths = activeRule?.referralValidityMonths ?? 6;

  // Sinh QR server-side thành data URL (không cần client lib)
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://ivihoantien.com"}/register?ref=${customerCode}`;
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(inviteUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#2d1f14", light: "#ffffff" },
    });
  } catch (_) {}

  return (
    <div className="flex flex-col gap-lg fade-in">

      {/* ═══ HEADER CHÀO MỪNG ═══ */}
      <div
        className="relative overflow-hidden rounded-3xl p-xl sm:p-2xl"
        style={{ background: "linear-gradient(135deg, #fff3ee 0%, #fde8d8 50%, #ffecd2 100%)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#ffcba4] opacity-30" />
        <div className="pointer-events-none absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-[#ffa07a] opacity-20" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#ffe0cc] opacity-40" />

        <div className="relative z-10 flex items-center justify-between gap-lg flex-wrap">
          <div className="flex items-center gap-lg">
            <img
              src="/heochaomung.png"
              alt="Heo chào mừng"
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-lg shrink-0"
            />
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#e86a33]/60 mb-1">
                Chào mừng trở lại
              </p>
              <h1 className="text-[26px] sm:text-[32px] font-black leading-tight text-[#2d1f14]">
                Xin chào, <span className="text-[#e86a33]">{firstName}</span>! 🎉
              </h1>
              <p className="mt-1 text-[13px] text-[#a0816a] leading-relaxed">
                {allOrders.length === 0
                  ? "Chưa có đơn nào — hãy chia sẻ link để bắt đầu hoàn tiền!"
                  : `Bạn có ${allOrders.length} đơn đã ghi nhận. Tiếp tục kiếm tiền nhé! 🐷`}
              </p>
            </div>
          </div>

          <div className="flex gap-sm flex-wrap items-center">
            <a href="/app/refunds">
              <button className="flex items-center gap-xs rounded-2xl bg-[#e86a33] px-xl py-[10px] text-[13px] font-bold text-white shadow-md shadow-[#e86a33]/30 transition-all hover:bg-[#d65d2a] hover:shadow-lg active:scale-[0.97]">
                Hoàn tiền ngay
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* ═══ 4 STAT CARDS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Card 1: Chờ duyệt */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-60" />
          <div className="relative">
            <div className="flex items-start justify-between mb-md">
              <img src="/heochodoi.png" alt="" className="h-11 w-11 object-contain transition-transform group-hover:scale-110" />
              <span className="rounded-full bg-amber-100 px-sm py-[3px] text-[10px] font-bold text-amber-600">Đang xử lý</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Chờ duyệt</div>
            <div className="text-[20px] font-black text-gray-900 tabular-nums leading-tight">{formatCurrency(pendingIncome)}</div>
            <div className="mt-1 text-[11px] text-gray-400">
              {allOrders.filter((o) => o.orderStatus === "pending").length} đơn hàng
            </div>
          </div>
        </div>

        {/* Card 2: Sẵn sàng rút */}
        <div
          className="group relative overflow-hidden rounded-2xl p-lg shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #f1fdf2 100%)", outline: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="relative">
            <div className="flex items-start justify-between mb-md">
              <div className="relative">
                <img src="/heovitien.png" alt="" className="h-11 w-11 object-contain transition-transform group-hover:scale-110" />
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                  <span className="text-[9px] font-black text-white">✓</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-sm py-[3px] text-[10px] font-bold text-emerald-600">Rút được</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Sẵn sàng rút</div>
            <div className="text-[20px] font-black text-gray-900 tabular-nums leading-tight">{formatCurrency(availableBalance)}</div>
            <div className="mt-1 text-[11px] text-gray-400">
              {allOrders.filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid").length} đơn hàng
            </div>
          </div>
        </div>

        {/* Card 3: Đã rút */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-rose-50 opacity-50" />
          <div className="relative">
            <div className="flex items-start justify-between mb-md">
              <img src="/heongansach.png" alt="" className="h-11 w-11 object-contain transition-transform group-hover:scale-110" />
              <span className="rounded-full bg-orange-100 px-sm py-[3px] text-[10px] font-bold text-orange-600">Đã nhận</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Đã rút</div>
            <div className="text-[20px] font-black text-gray-900 tabular-nums leading-tight">{formatCurrency(paidTotal)}</div>
            <div className="mt-1 text-[11px] text-gray-400">
              {allOrders.filter((o) => o.payoutStatus === "paid").length} đơn hàng
            </div>
          </div>
        </div>

        {/* Card 4: Tổng tích luỹ */}
        <div
          className="group relative overflow-hidden rounded-2xl p-lg shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #f3e8ff 0%, #fdf4ff 100%)", outline: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="relative">
            <div className="flex items-start justify-between mb-md">
              <img src="/heoquatang.png" alt="" className="h-11 w-11 object-contain transition-transform group-hover:scale-110" />
              <span className="rounded-full bg-purple-100 px-sm py-[3px] text-[10px] font-bold text-purple-600">Tổng cộng</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Tổng tích luỹ</div>
            <div className="text-[20px] font-black text-gray-900 tabular-nums leading-tight">{formatCurrency(totalIncome)}</div>
            <div className="mt-1 text-[11px] text-gray-400">{allOrders.length} đơn hàng</div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM PANELS ═══ */}
      <div className="grid grid-cols-1 gap-lg xl:grid-cols-[2fr_1fr]">

        {/* LỊCH SỬ ĐƠN HÀNG với ảnh preview */}
        <div className="rounded-3xl bg-white p-md sm:p-xl shadow-sm ring-1 ring-black/[0.06] overflow-hidden">
          <div className="mb-lg flex items-center justify-between border-b border-gray-100 pb-md">
            <h2 className="flex items-center gap-sm text-[15px] font-bold text-gray-900">
              <img src="/heothongbao.png" alt="" className="h-8 w-8 object-contain" />
              Lịch sử đơn hàng
            </h2>
            <a
              href="/app/orders"
              className="flex items-center gap-[3px] text-[12px] font-bold text-[#e86a33] hover:text-[#d65d2a] transition-colors"
            >
              Xem tất cả
              <ChevronRight size={14} strokeWidth={2.5} />
            </a>
          </div>

          {allOrders.length === 0 ? (
            <div className="flex flex-col items-center py-2xl text-center">
              <img src="/heochodoi.png" alt="" className="mb-lg h-20 w-20 object-contain" />
              <div className="text-[14px] font-semibold text-gray-700">Chưa có đơn hàng nào</div>
              <div className="mt-xs text-[12px] text-gray-400">Chia sẻ link để bắt đầu kiếm tiền hoàn!</div>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-50">
              {allOrders.map((order) => {
                const platformCode = order.platform?.code?.toUpperCase() ?? "";
                const platformColor = PLATFORM_STYLE[platformCode]?.color ?? "#e86a33";
                const productImage = order.trackingLink?.productImage ?? null;
                const productTitle =
                  order.trackingLink?.productTitle ??
                  order.itemName ??
                  `Đơn hàng ${order.orderExternalId}`;

                return (
                  <li
                    key={order.id}
                    className="flex items-center gap-sm sm:gap-md py-md px-xs hover:bg-orange-50/30 rounded-xl transition-colors"
                  >
                    {/* Ảnh sản phẩm */}
                    <ProductThumb image={productImage} color={platformColor} platform={platformCode} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-semibold text-gray-800">{productTitle}</p>
                      <div className="flex items-center gap-xs mt-[2px]">
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: platformColor }}
                        >
                          {order.platform?.name ?? platformCode}
                        </span>
                        <span className="text-gray-200">•</span>
                        <span className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    {/* Số tiền + trạng thái */}
                    <div className="flex flex-col items-end gap-[3px] shrink-0 max-w-[92px] sm:max-w-none">
                      <span className="text-[12px] sm:text-[13px] font-black text-emerald-600 whitespace-nowrap">
                        +{formatCurrency(order.customerRewardAmount)}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-xs sm:px-sm py-[2px] rounded-full whitespace-nowrap ${
                          order.payoutStatus === "paid"
                            ? "bg-emerald-100 text-emerald-600"
                            : order.payoutStatus === "processing"
                            ? "bg-blue-100 text-blue-600"
                            : order.orderStatus === "approved"
                            ? "bg-green-100 text-green-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {order.payoutStatus === "paid"
                          ? "Đã rút"
                          : order.payoutStatus === "processing"
                          ? "Đang xử lý"
                          : order.orderStatus === "approved"
                          ? "Sẵn sàng rút"
                          : "Chờ duyệt"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* PANEL PHẢI */}
        <div className="flex flex-col gap-lg">
          {/* Giới thiệu bạn bè với QR */}
          <InviteSection
            customerCode={customerCode}
            qrDataUrl={qrDataUrl}
            referralRate={referralRate}
            maxReferralOrders={maxReferralOrders}
            referralValidityMonths={referralValidityMonths}
          />

          {/* Truy cập nhanh */}
          <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/[0.06]">
            <h2 className="mb-md flex items-center gap-sm text-[14px] font-bold text-gray-700">
              <img src="/heodashboard.png" alt="" className="h-7 w-7 object-contain" />
              Truy cập nhanh
            </h2>
            <div className="grid grid-cols-2 gap-sm">
              {[
                { href: "/app/wallet", label: "Rút tiền", img: "/heovitien.png", bg: "bg-emerald-50", text: "text-emerald-600" },
                { href: "/app/refunds", label: "Hoàn tiền", img: "/heogiamgia.png", bg: "bg-orange-50", text: "text-orange-600" },
                { href: "/app/orders", label: "Đơn hàng", img: "/heongansach.png", bg: "bg-blue-50", text: "text-blue-600" },
                { href: "/app/deals", label: "Ưu đãi hot", img: "/heoqua.png", bg: "bg-purple-50", text: "text-purple-600" },
              ].map(({ href, label, img, bg, text }) => (
                <a
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-xs rounded-2xl ${bg} p-md transition-all hover:-translate-y-0.5 hover:shadow-sm`}
                >
                  <img src={img} alt="" className="h-9 w-9 object-contain" />
                  <span className={`text-[12px] font-bold ${text}`}>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side component nhỏ để render ảnh sản phẩm (tránh hydration mismatch)
function ProductThumb({
  image,
  color,
  platform,
}: {
  image: string | null;
  color: string;
  platform: string;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-black/[0.06] shadow-sm"
      />
    );
  }
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
      style={{ backgroundColor: `${color}18`, color }}
    >
      <ShoppingBag size={18} strokeWidth={1.75} />
    </div>
  );
}
