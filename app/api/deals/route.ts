import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateShortCode, buildShortUrl } from "@/lib/shortLink";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// GET: danh sách deals (public hoặc admin)
export async function GET(req: NextRequest) {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  const deals = await prisma.dealPost.findMany({
    where: isAdmin ? undefined : { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ deals });
}

// POST: tạo deal mới (admin only)
export async function POST(req: NextRequest) {
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
  const rawInputLink = formData.get("rawInputLink") as string;
  const cleanLink = formData.get("cleanLink") as string;
  const affiliateUrl = formData.get("affiliateUrl") as string;
  const shopeeImageUrl = formData.get("shopeeImageUrl") as string | null;
  const platformCode = (formData.get("platformCode") as string) || "SHOPEE";
  const tags = formData.get("tags") as string | null;
  const imageFile = formData.get("image") as File | null;

  // Dùng shortCode pre-generated từ bước resolve (client đã giữ sẵn)
  const proposedShortCode = formData.get("shortCode") as string | null;
  const proposedShortUrl = formData.get("shortUrl") as string | null;

  if (!title || !rawInputLink || !cleanLink || !affiliateUrl) {
    return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc" }, { status: 400 });
  }

  // Xử lý upload ảnh (nếu có)
  let uploadedImageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "deals");
    await mkdir(uploadDir, { recursive: true });
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await imageFile.arrayBuffer()));
    uploadedImageUrl = `/uploads/deals/${filename}`;
  }

  // Dùng shortCode client đã pre-generate ở bước resolve, nếu không có thì tạo mới
  const shortCode = proposedShortCode || await generateShortCode();
  const shortUrl = proposedShortUrl || buildShortUrl(shortCode);

  const deal = await prisma.dealPost.create({
    data: {
      title,
      description: description || null,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      discountPercent: discountPercent ? parseInt(discountPercent) : null,
      rawInputLink,
      cleanLink,
      affiliateUrl,
      shortCode,
      shortUrl,
      uploadedImageUrl,
      shopeeImageUrl: shopeeImageUrl || null,
      platformCode,
      tags: tags || null,
      status: "active",
      createdByUserId: session.userId,
    },
  });

  return NextResponse.json({ deal });
}
