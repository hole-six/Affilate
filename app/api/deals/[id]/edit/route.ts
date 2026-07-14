import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// POST: cập nhật deal kèm upload ảnh mới (admin only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const originalPrice = formData.get("originalPrice") as string | null;
  const salePrice = formData.get("salePrice") as string | null;
  const discountPercent = formData.get("discountPercent") as string | null;
  const imageFile = formData.get("image") as File | null;

  let uploadedImageUrl: string | undefined = undefined;
  if (imageFile && imageFile.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "deals");
    await mkdir(uploadDir, { recursive: true });
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await imageFile.arrayBuffer()));
    uploadedImageUrl = `/uploads/deals/${filename}`;
  }

  const deal = await prisma.dealPost.update({
    where: { id: params.id },
    data: {
      title,
      description: description || null,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      discountPercent: discountPercent ? parseInt(discountPercent) : null,
      ...(uploadedImageUrl ? { uploadedImageUrl } : {}),
    },
  });

  return NextResponse.json({ deal });
}
