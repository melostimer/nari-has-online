export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Giriş yapınız" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        orderItems: {
          include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } },
        },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    // Admin her siparişi görebilir, müşteri sadece kendi siparişini
    if (role !== "ADMIN" && order.userId !== userId) {
      return NextResponse.json({ error: "Erişim reddedildi" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sipariş alınamadı" }, { status: 500 });
  }
}
