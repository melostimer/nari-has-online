export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const body = await req.json();
    const category = await prisma.category.create({ data: { name: body.name, emoji: body.emoji, order: body.order ?? 0 } });
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: "Kategori eklenemedi" }, { status: 500 });
  }
}
