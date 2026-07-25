import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Users, Clock } from "lucide-react";
import { DashboardChart } from "./DashboardChart";

export const metadata: Metadata = { title: "Dashboard | Admin" };

export default async function AdminDashboard() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalOrders, todayOrders, totalRevenue, todayRevenue, totalCustomers, pendingOrders] = await Promise.all([
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } } }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { totalPrice: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } }, _sum: { totalPrice: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  // Last 7 days data
  const dailyStats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayStart); date.setDate(date.getDate() - i);
    const nextDate = new Date(date); nextDate.setDate(nextDate.getDate() + 1);
    const [count, rev] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: date, lt: nextDate }, status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: date, lt: nextDate }, status: { not: "CANCELLED" } }, _sum: { totalPrice: true } }),
    ]);
    dailyStats.push({
      date: date.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" }),
      orders: count, revenue: Number(rev._sum.totalPrice ?? 0),
    });
  }

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5, orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, orderItems: { select: { quantity: true } } },
  });

  const stats = [
    { label: "Bugunun Siparisleri", value: todayOrders, sub: `Toplam: ${totalOrders}`, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Bugunun Cirosu", value: formatPrice(Number(todayRevenue._sum.totalPrice ?? 0)), sub: `Toplam: ${formatPrice(Number(totalRevenue._sum.totalPrice ?? 0))}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Musteriler", value: totalCustomers, sub: "Kayitli musteri", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Bekleyen Siparisler", value: pendingOrders, sub: "Onay bekliyor", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <DashboardChart data={dailyStats} />
    </div>
  );
}
