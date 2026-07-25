import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function requireAdmin(session: any) {
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const err = requireAdmin(session);
    if (err) return err;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const [totalOrders, todayOrders, weekOrders, totalRevenue, todayRevenue, totalCustomers, pendingOrders] =
      await Promise.all([
        prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
        prisma.order.count({ where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } } }),
        prisma.order.count({ where: { createdAt: { gte: weekStart }, status: { not: "CANCELLED" } } }),
        prisma.order.aggregate({
          where: { status: { not: "CANCELLED" } },
          _sum: { totalPrice: true },
        }),
        prisma.order.aggregate({
          where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } },
          _sum: { totalPrice: true },
        }),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.count({ where: { status: "PENDING" } }),
      ]);

    // Son 7 gün için günlük istatistik
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [count, revenue] = await Promise.all([
        prisma.order.count({
          where: { createdAt: { gte: date, lt: nextDate }, status: { not: "CANCELLED" } },
        }),
        prisma.order.aggregate({
          where: { createdAt: { gte: date, lt: nextDate }, status: { not: "CANCELLED" } },
          _sum: { totalPrice: true },
        }),
      ]);

      dailyStats.push({
        date: date.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" }),
        orders: count,
        revenue: Number(revenue._sum.totalPrice ?? 0),
      });
    }

    return NextResponse.json({
      totalOrders,
      todayOrders,
      weekOrders,
      totalRevenue: Number(totalRevenue._sum.totalPrice ?? 0),
      todayRevenue: Number(todayRevenue._sum.totalPrice ?? 0),
      totalCustomers,
      pendingOrders,
      dailyStats,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Stats alınamadı" }, { status: 500 });
  }
}
