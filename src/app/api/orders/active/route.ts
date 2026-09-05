export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null);

  const userId = (session.user as any).id;

  // 1. Önce aktif (devam eden) sipariş var mı kontrol et
  const activeOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "PREPARING", "ON_THE_WAY"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      updatedAt: true,
      estimatedTime: true,
      createdAt: true,
    },
  });

  if (activeOrder) return NextResponse.json(activeOrder);

  // 2. Aktif sipariş yoksa, son 1 saat içinde iptal edilmiş sipariş var mı?
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const cancelledOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: "CANCELLED",
      updatedAt: { gte: oneHourAgo },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      updatedAt: true,
      estimatedTime: true,
      createdAt: true,
    },
  });

  return NextResponse.json(cancelledOrder);
}
