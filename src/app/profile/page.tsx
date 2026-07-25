import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice, formatDate, shortId } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { User, Package, Phone, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Profilim" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      orders: {
        include: { orderItems: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="section-container max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Profilim</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">{user.name[0].toUpperCase()}</span>
              </div>
              <h2 className="font-semibold text-xl text-gray-900">{user.name}</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-brand-400" />{user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-brand-400" />{user.phone}
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{user.orders.length}</div>
                  <div className="text-xs text-gray-400 mt-1">Toplam Siparis</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(user.orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + Number(o.totalPrice), 0))}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Toplam Harcama</div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="h-5 w-5 text-brand-500" />
                <h2 className="font-semibold text-gray-900">Siparis Gecmisi</h2>
              </div>
              {user.orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">&#128722;</p>
                  <p className="text-gray-500">Henuz siparis vermediniz</p>
                  <Link href="/menu" className="inline-block mt-4 px-6 py-2 bg-brand-gradient text-white rounded-xl font-semibold text-sm hover:opacity-90">Siparis Ver</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`} className="block p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-brand-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{shortId(order.id)}</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {order.orderItems.map(i => i.product.name).join(", ")}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                        <span className="font-bold text-brand-600">{formatPrice(Number(order.totalPrice))}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
