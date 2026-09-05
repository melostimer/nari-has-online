export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function checkAdminOrStaff() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "STAFF")) return null;
  return session;
}

export async function GET() {
  if (!(await checkAdminOrStaff())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: {
          include: { product: { select: { name: true, price: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Siparişler alınamadı" }, { status: 500 });
  }
}
