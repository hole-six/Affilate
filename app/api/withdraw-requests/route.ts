import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendMail, buildAdminWithdrawRequestEmail, buildCustomerWithdrawRequestEmail } from "@/lib/mailer";

const MIN_WITHDRAW_AMOUNT = 10000;

export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: { orders: true, user: true },
  });
  if (!customer) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const available = customer.orders
    .filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  if (available < MIN_WITHDRAW_AMOUNT) {
    return NextResponse.json(
      { error: `Số dư khả dụng tối thiểu ${MIN_WITHDRAW_AMOUNT.toLocaleString("vi-VN")}đ mới được gửi yêu cầu rút tiền` },
      { status: 400 }
    );
  }

  if (!customer.bankName || !customer.bankAccountNumber || !customer.bankAccountName) {
    return NextResponse.json(
      { error: "Vui lòng cập nhật đầy đủ thông tin tài khoản ngân hàng trước khi rút tiền" },
      { status: 400 }
    );
  }

  const existingPending = await prisma.withdrawRequest.findFirst({
    where: { customerId: customer.id, status: "pending" },
  });
  if (existingPending) {
    return NextResponse.json(
      { error: "Bạn đã có một yêu cầu rút tiền đang chờ xử lý, vui lòng đợi admin xác nhận" },
      { status: 409 }
    );
  }

  const request = await prisma.withdrawRequest.create({
    data: { customerId: customer.id, amount: available },
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    void sendMail({
      to: adminEmail,
      subject: `[Yêu cầu rút tiền] ${customer.fullName} (${customer.customerCode})`,
      html: buildAdminWithdrawRequestEmail({
        customerName: customer.fullName,
        customerCode: customer.customerCode,
        amount: available,
      }),
    });
  }

  // Gửi ngược về cho khách để họ phát hiện sớm nếu có ai đó chiếm được tài
  // khoản và tự ý gửi yêu cầu rút tiền mà không phải chính chủ.
  if (customer.user?.email) {
    void sendMail({
      to: customer.user.email,
      subject: "🔒 Yêu cầu rút tiền vừa được tạo trên tài khoản của bạn",
      html: buildCustomerWithdrawRequestEmail({
        fullName: customer.fullName,
        amount: available,
        bankName: customer.bankName,
        bankAccountNumber: customer.bankAccountNumber,
      }),
    });
  }

  return NextResponse.json({
    request: { id: request.id, amount: Number(request.amount), createdAt: request.createdAt },
  });
}
