import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyCustomerTelegram } from "@/lib/telegramNotify";
import { buildPaymentPaidMessage } from "@/lib/telegramBot";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const formData = await req.formData();
  const transferReference = formData.get("transferReference") as string | null;
  const transferNote = formData.get("transferNote") as string | null;
  const bill = formData.get("bill") as File | null;

  let billStorageKey: string | undefined;
  if (bill && bill.size > 0) {
    const uploadDir = path.join(process.cwd(), "storage", "bills");
    await mkdir(uploadDir, { recursive: true });
    billStorageKey = `${randomUUID()}-${bill.name}`;
    await writeFile(path.join(uploadDir, billStorageKey), Buffer.from(await bill.arrayBuffer()));
  }

  const batch = await prisma.paymentBatch.update({
    where: { id: params.id },
    data: {
      status: "paid",
      transferReference: transferReference ?? undefined,
      transferNote: transferNote ?? undefined,
      billStorageKey,
      paidByUserId: session.userId,
      paidAt: new Date(),
    },
    include: { items: true },
  });

  await prisma.order.updateMany({
    where: { id: { in: batch.items.map((i) => i.orderId) } },
    data: { payoutStatus: "paid" },
  });

  void notifyCustomerTelegram(
    batch.customerId,
    buildPaymentPaidMessage({
      amount: Number(batch.totalAmount),
      paymentCode: batch.paymentCode,
      transferReference: batch.transferReference,
    })
  );

  return NextResponse.json({ batch });
}
