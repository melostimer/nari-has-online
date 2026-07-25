import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");

    const where: any = { isAvailable: true };
    if (categoryId) where.categoryId = categoryId;
    if (featured === "true") where.isFeatured = true;

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, emoji: true } } },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(products);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Rürunler alınamadı" }, { status: 500 });
  }
}
