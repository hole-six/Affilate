import { detectPlatform } from "./linkConversion";
import { formatCurrency } from "./format";

export type TelegramIncomingMessage = {
  raw: unknown;
  senderId: string | null;
  chatId: string | null;
  text: string | null;
  messageId: string | null;
  username: string | null;
  fullName: string | null;
  eventName: string;
  callbackQueryId: string | null;
};

export type TelegramSendResult = {
  ok: boolean;
  simulated: boolean;
  response?: unknown;
  error?: string;
};

export type TelegramInlineKeyboard = {
  inline_keyboard: { text: string; callback_data: string }[][];
};

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function extractTelegramMessage(payload: any): TelegramIncomingMessage {
  // Nút inline được bấm -> Telegram gửi update dạng callback_query, không phải message.
  const callback = payload?.callback_query ?? null;
  if (callback) {
    return {
      raw: payload,
      senderId: callback.from?.id?.toString?.() ?? null,
      chatId: callback.message?.chat?.id?.toString?.() ?? null,
      text: typeof callback.data === "string" ? callback.data : null,
      messageId: callback.message?.message_id?.toString?.() ?? null,
      username: callback.from?.username ?? null,
      fullName: [callback.from?.first_name, callback.from?.last_name].filter(Boolean).join(" ") || null,
      eventName: "callback_query",
      callbackQueryId: callback.id?.toString?.() ?? null,
    };
  }

  const message = payload?.message ?? payload?.edited_message ?? payload?.channel_post ?? null;
  const from = message?.from ?? null;
  const chat = message?.chat ?? null;

  return {
    raw: payload,
    senderId: from?.id?.toString?.() ?? null,
    chatId: chat?.id?.toString?.() ?? null,
    text: typeof message?.text === "string" ? message.text.trim() : null,
    messageId: message?.message_id?.toString?.() ?? null,
    username: from?.username ?? null,
    fullName: [from?.first_name, from?.last_name].filter(Boolean).join(" ") || null,
    eventName: message ? "message" : "unknown",
    callbackQueryId: null,
  };
}

export function extractFirstUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(URL_REGEX);
  return match?.[0] ?? null;
}

export function buildMainMenuKeyboard(): TelegramInlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "🔄 Đổi link nhanh", callback_data: "newlink" }],
      [
        { text: "💰 Số dư ví", callback_data: "wallet" },
        { text: "📦 Đơn hàng", callback_data: "orders" },
      ],
      [
        { text: "🔗 Link của tôi", callback_data: "links" },
        { text: "📖 Hướng dẫn", callback_data: "help" },
      ],
    ],
  };
}

export function buildConvertLinkPromptMessage(): string {
  return [
    "🔄 <b>Đổi link nhanh</b>",
    "",
    "Dán link Shopee hoặc TikTok bạn muốn đổi vào ngay khung chat này (chỉ cần gửi link, không cần lệnh gì thêm), bot sẽ trả về link hoàn tiền ngay lập tức.",
  ].join("\n");
}

export function buildTelegramHelpMessage(): string {
  return [
    "👋 <b>Chào mừng đến với bot Hoàn Tiền!</b>",
    "",
    "Gửi link Shopee hoặc TikTok, bot sẽ đổi sang link hoàn tiền ngay lập tức.",
    "",
    "<b>Lệnh nhanh:</b>",
    "💰 /wallet — xem số dư hoàn tiền",
    "📦 /orders — 5 đơn hàng gần nhất",
    "🔗 /links — 5 link đã tạo gần nhất",
    "📖 /help — xem lại hướng dẫn này",
    "",
    "Ví dụ: <code>https://shopee.vn/...</code>",
  ].join("\n");
}

export function buildLinkPromptMessage(): string {
  return [
    "🔐 <b>Tài khoản Telegram này chưa liên kết với web.</b>",
    "",
    "Số dư/đơn hàng bạn thấy ở đây đang tính theo một hồ sơ Telegram riêng, có thể không khớp với tài khoản bạn đăng nhập trên web.",
    "",
    "Vào mục <b>Ví tiền</b> trên web → bấm <b>Liên kết Telegram</b> → bấm nút mở Telegram để đồng bộ đúng 1 tài khoản duy nhất.",
  ].join("\n");
}

export function buildLinkSuccessMessage(params: { fullName: string; customerCode: string }): string {
  return [
    "✅ <b>Liên kết thành công!</b>",
    "",
    `Xin chào <b>${escapeHtml(params.fullName)}</b> (${params.customerCode}).`,
    "Từ giờ mọi thao tác trên bot sẽ đồng bộ trực tiếp với tài khoản web của bạn.",
  ].join("\n");
}

export function buildLinkExpiredMessage(): string {
  return [
    "⚠️ Mã liên kết không hợp lệ hoặc đã hết hạn.",
    "Vào lại mục <b>Ví tiền</b> trên web để lấy mã liên kết mới nhé.",
  ].join("\n");
}

export function buildUnsupportedPlatformMessage(rawUrl: string): string {
  return [
    "🙁 Bot đã nhận link nhưng hiện chỉ hỗ trợ <b>Shopee</b> và <b>TikTok Shop</b>.",
    `Link vừa gửi: ${escapeHtml(rawUrl)}`,
  ].join("\n");
}

export function buildAffiliateReplyMessage(params: {
  platformName: string;
  affiliateUrl: string;
  trackingCode: string;
  customerCode: string;
}): string {
  return [
    `✅ <b>Đã đổi link ${escapeHtml(params.platformName)} thành công!</b>`,
    "",
    `🔗 <a href="${params.affiliateUrl}">${params.affiliateUrl}</a>`,
    "",
    `Mã khách: <code>${params.customerCode}</code>`,
    `Mã tracking: <code>${params.trackingCode}</code>`,
    "",
    "⚠️ Hãy bấm vào link này <b>trước khi mua</b> để hệ thống đối soát hoa hồng chính xác.",
  ].join("\n");
}

export function buildOrderApprovedMessage(params: {
  orderExternalId: string;
  customerRewardAmount: number;
  shopName?: string | null;
}): string {
  return [
    "🎉 <b>Đơn hàng của bạn vừa được duyệt!</b>",
    "",
    `Mã đơn: <code>${escapeHtml(params.orderExternalId)}</code>`,
    params.shopName ? `Shop: ${escapeHtml(params.shopName)}` : null,
    `Số tiền được hoàn: <b>${formatCurrency(params.customerRewardAmount)}</b>`,
    "",
    "Gõ /wallet để xem tổng số dư bất cứ lúc nào.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPaymentPaidMessage(params: {
  amount: number;
  paymentCode: string;
  transferReference?: string | null;
}): string {
  return [
    "💸 <b>Bạn vừa được thanh toán!</b>",
    "",
    `Mã phiếu: <code>${params.paymentCode}</code>`,
    `Số tiền: <b>${formatCurrency(params.amount)}</b>`,
    params.transferReference ? `Mã giao dịch: <code>${escapeHtml(params.transferReference)}</code>` : null,
    "",
    "Cảm ơn bạn đã đồng hành cùng hệ thống hoàn tiền! 🙏",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOrdersListMessage(
  orders: { orderExternalId: string; orderStatus: string; customerRewardAmount: number }[]
): string {
  if (orders.length === 0) {
    return "📦 Bạn chưa có đơn hàng nào. Đổi link và mua sắm để bắt đầu tích luỹ nhé!";
  }

  const statusEmoji: Record<string, string> = { approved: "✅", pending: "⏳", rejected: "❌" };
  const lines = orders.map((o) => {
    const emoji = statusEmoji[o.orderStatus] ?? "•";
    return `${emoji} <code>${escapeHtml(o.orderExternalId)}</code> — ${escapeHtml(o.orderStatus)} — <b>${formatCurrency(o.customerRewardAmount)}</b>`;
  });

  return ["📦 <b>5 đơn hàng gần nhất:</b>", "", ...lines, "", "Gõ /wallet để xem tổng số dư."].join("\n");
}

export function buildLinksListMessage(
  links: { trackingCode: string; shortUrl: string | null; createdAt: Date }[]
): string {
  if (links.length === 0) {
    return "🔗 Bạn chưa tạo link nào. Gửi link Shopee/TikTok cho bot để bắt đầu đổi link hoàn tiền.";
  }

  const lines = links.map((l) => `🔗 <a href="${l.shortUrl ?? "#"}">${l.shortUrl ?? l.trackingCode}</a>`);

  return ["🔗 <b>5 link gần nhất của bạn:</b>", "", ...lines].join("\n");
}

export function buildWalletMessage(params: {
  customerName: string;
  customerCode: string;
  available: number;
  processing: number;
  paid: number;
  totalOrders: number;
}): string {
  return [
    `💰 <b>Ví hoàn tiền của ${escapeHtml(params.customerName)}</b>`,
    `Mã khách: <code>${params.customerCode}</code>`,
    "",
    `🎒 Sẵn sàng rút: <b>${formatCurrency(params.available)}</b>`,
    `⏳ Đang xử lý: <b>${formatCurrency(params.processing)}</b>`,
    `✅ Đã thanh toán: <b>${formatCurrency(params.paid)}</b>`,
    "",
    `📦 Tổng số đơn: ${params.totalOrders}`,
  ].join("\n");
}

export function mapDetectedPlatformToCode(url: string): "SHOPEE" | "TIKTOK" | null {
  const platform = detectPlatform(url);
  if (platform === "shopee") return "SHOPEE";
  if (platform === "tiktok") return "TIKTOK";
  return null;
}

export async function sendTelegramTextMessage(params: {
  chatId: string;
  message: string;
  keyboard?: TelegramInlineKeyboard;
}): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return {
      ok: true,
      simulated: true,
      response: {
        reason: "Missing TELEGRAM_BOT_TOKEN",
        chatId: params.chatId,
        message: params.message,
      },
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: params.keyboard,
      }),
    });

    const responseBody = await response.json().catch(() => null);
    return {
      ok: response.ok,
      simulated: false,
      response: responseBody,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      simulated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function answerTelegramCallbackQuery(callbackQueryId: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId }),
    });
  } catch {
    // Không nghiêm trọng nếu answerCallbackQuery lỗi — nút chỉ hết loading chậm hơn.
  }
}
