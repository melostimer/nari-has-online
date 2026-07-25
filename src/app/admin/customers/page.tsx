import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { Users, Mail, Phone } from "lucide-react";

export const metadata: Metadata = { title: "Musteriler | Admin" };

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        select: { totalPrice: true, status: true },
        where: { status: { not: "CANCELLED" } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Musteriler</h1>
        <span className="bg-brand-100 text-brand-700 font-semibold text-sm px-3 py-1 rounded-full">
          {customers.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Musteri</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Iletisim</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Siparis</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Toplam Harcama</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kayit Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => {
                const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{c.name[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />{c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />{c.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">{c._count.orders}</span>
                      <span className="text-gray-400 text-sm ml-1">siparis</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-brand-600">{formatPrice(totalSpent)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500">{formatDate(c.createdAt)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Henuz kayitli musteri yok</p>
          </div>
        )}
      </div>
    </div>
  );
}
