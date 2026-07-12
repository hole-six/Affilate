import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createTrackingLink } from "@/lib/trackingLinkService";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
  }

  const customerId = session.role === "customer" ? session.customerId : req.nextUrl.searchParams.get("customerId");

  const links = await prisma.trackingLink.findMany({
    where: customerId ? { customerId } : undefined,
    include: { platform: true, customer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    links: links.map((link) => ({
      ...link,
      generatedLink: link.affiliateUrl,
      subId: link.subId2,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
  }

  const body = await req.json();
  const { originalUrl, platformId, channelSource = "web" } = body as {
    originalUrl?: string;
    platformId?: string;
    channelSource?: "web" | "zalo" | "telegram";
  };

  if (!originalUrl || !platformId) {
    return NextResponse.json({ error: "Thieu link goc hoac nen tang" }, { status: 400 });
  }

  const customerId = session.role === "customer" ? session.customerId : body.customerId;
  if (!customerId) {
    return NextResponse.json({ error: "Thieu khach hang" }, { status: 400 });
  }

  try {
    const result = await createTrackingLink({
      originalUrl,
      platformId,
      customerId,
      channelSource,
      createdByUserId: session.userId,
    });

    return NextResponse.json({
      success: true,
      data: [
        {
          ...result.link,
          generatedLink: result.generatedLink,
          subId: result.subId,
          shortCode: result.shortCode,
        },
      ],
      link: {
        ...result.link,
        generatedLink: result.generatedLink,
        subId: result.subId,
        shortCode: result.shortCode,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Khong tao duoc link",
      },
      { status: 400 }
    );
  }
}
