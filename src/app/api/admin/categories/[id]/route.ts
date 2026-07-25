import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const body = await req.json();
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name: body.name, emoji: body.emoji, order: body.order },
    });
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    // Check if category has products
    const hasProducts = await prisma.product.count({ where: { categoryId: params.id } });
    if (hasProducts > 0) return NextResponse.json({ error: "Bu kategoriye ait urunler var, once onlari silin veya tasiyin" }, { status: 400 });

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
