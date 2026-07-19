import { prisma } from "./prisma";

/**
 * Sinh mã khách hàng tiếp theo (C0001, C0002, ...).
 *
 * TRƯỚC ĐÂY dùng prisma.customer.count() + 1 — sai vì dựa vào SỐ LƯỢNG bản
 * ghi hiện có, không phải mã LỚN NHẤT đã từng cấp. Chỉ cần 1 khách bị xoá
 * (kể cả tài khoản test) là count() tụt xuống, sinh ra mã đã cấp cho ai đó
 * trước đó rồi — tại produciton gây lỗi 500 "Unique constraint failed on
 * customer_code" ngay khi có khách đăng ký mới. Giờ lấy đúng mã SỐ LỚN NHẤT
 * đang tồn tại rồi +1, không bao giờ đụng lại mã cũ dù có xoá bao nhiêu.
 */
export async function generateCustomerCode(): Promise<string> {
  const lastCustomer = await prisma.customer.findFirst({
    orderBy: { customerCode: "desc" },
    select: { customerCode: true },
  });

  let nextNumber = 1;
  const match = lastCustomer?.customerCode.match(/^C(\d+)$/);
  if (match) {
    nextNumber = parseInt(match[1], 10) + 1;
  }

  return `C${String(nextNumber).padStart(4, "0")}`;
}
