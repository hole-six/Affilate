import { prisma } from "./prisma";
import { notifyCustomerInApp } from "./notifications";
import { notifyCustomerTelegram } from "./telegramNotify";
import { buildAdminMessageAlert } from "./telegramBot";

const PREVIEW_MAX_LENGTH = 120;

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function getThreadWithMessages(customerId: string) {
  return prisma.supportThread.findUnique({
    where: { customerId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function markThreadReadByAdmin(customerId: string) {
  await prisma.supportThread.updateMany({
    where: { customerId, adminUnreadCount: { gt: 0 } },
    data: { adminUnreadCount: 0 },
  });
}

export async function markThreadReadByCustomer(customerId: string) {
  await prisma.supportThread.updateMany({
    where: { customerId, customerUnreadCount: { gt: 0 } },
    data: { customerUnreadCount: 0 },
  });
}

// CHỈ admin được gọi hàm này để mở/tiếp tục hội thoại — đây là nơi duy nhất
// tạo mới SupportThread, đúng chủ trương "khách không tự nhắn trước được".
export async function sendAdminMessageToCustomer(params: {
  customerId: string;
  adminUserId: string;
  message: string;
}) {
  const trimmed = params.message.trim();
  if (!trimmed) throw new Error("Nội dung tin nhắn không được để trống");

  const preview = truncate(trimmed, PREVIEW_MAX_LENGTH);
  const thread = await prisma.supportThread.upsert({
    where: { customerId: params.customerId },
    update: {
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
      customerUnreadCount: { increment: 1 },
      adminUnreadCount: 0,
    },
    create: {
      customerId: params.customerId,
      lastMessagePreview: preview,
      customerUnreadCount: 1,
    },
  });

  await prisma.supportMessage.create({
    data: {
      threadId: thread.id,
      senderRole: "admin",
      senderUserId: params.adminUserId,
      message: trimmed,
    },
  });

  void notifyCustomerInApp(params.customerId, {
    type: "admin_message",
    title: "💬 Tin nhắn từ Admin",
    message: trimmed,
    link: "/app/messages",
  });
  void notifyCustomerTelegram(params.customerId, buildAdminMessageAlert(trimmed));

  // Trả về bản đầy đủ kèm messages — caller (API route) trả thẳng cho UI,
  // thiếu messages sẽ khiến UI xoá sạch lịch sử hội thoại sau khi gửi.
  return getThreadWithMessages(params.customerId);
}

// Khách chỉ được trả lời khi ĐÃ có thread (tức admin nhắn trước) — không cho
// tự tạo thread mới, throw lỗi rõ ràng nếu chưa có.
export async function sendCustomerReply(params: { customerId: string; message: string }) {
  const trimmed = params.message.trim();
  if (!trimmed) throw new Error("Nội dung tin nhắn không được để trống");

  const thread = await prisma.supportThread.findUnique({ where: { customerId: params.customerId } });
  if (!thread) throw new Error("Chưa có tin nhắn từ admin để trả lời");

  const preview = truncate(trimmed, PREVIEW_MAX_LENGTH);
  await prisma.supportMessage.create({
    data: { threadId: thread.id, senderRole: "customer", message: trimmed },
  });

  await prisma.supportThread.update({
    where: { id: thread.id },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
      adminUnreadCount: { increment: 1 },
      customerUnreadCount: 0,
    },
  });

  return getThreadWithMessages(params.customerId);
}
