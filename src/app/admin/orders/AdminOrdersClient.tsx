"use client";

import { useState } from "react";
import { formatPrice, formatDate, shortId, getStatusLabel } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Phone, MapPin, Package, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const STATUSES = ["PENDING", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Sipariş Alındı", PREPARING: "Hazırlanıyor",
  ON_THE_WAY: "Yola Çıktı", DELIVERED: "Teslim Edildi", CANCELLED: "İptal Et",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700",
  PREPARING: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
  ON_THE_WAY: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
  CANCELLED: "bg-red-50 border-red-200 hover:bg-red-100 text-red-700",
};

export function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(orders.map((o) => o.id === id ? { ...o, status } : o));
    }
    setUpdating(null);
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold text-gray-900">Siparişler</h1>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw className="h-4 w-4" /> Yenile
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["ALL", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {s === "ALL" ? "Tümü" : getStatusLabel(s)}
            {<span className="ml-2 text-xs opacity-70">{s === "ALL" ? orders.length : orders.filter(o => o.status === s).length}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <p className="text-gray-400">Bu durumda sipariş bulunmuyor</p>
          </div>
        ) : filtered.map((order) => {
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
              {/* Header - always visible */}
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-mono">#{shortId(order.id)}</span>
                    <span className="font-semibold text-gray-900 text-sm">{order.user?.name || "—"}</span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-xs text-gray-400 hidden sm:block">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-bold text-brand-600">{formatPrice(Number(order.totalPrice))}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div className="px-6 pb-5 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Customer info */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Müşteri Bilgileri</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-500 w-20">Ad Soyad</span>
                          <span className="font-semibold text-gray-800">{order.user?.name || "—"}</span>
                        </div>
                        {order.user?.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                            <a href={`tel:${order.user.phone}`} className="text-brand-600 hover:underline font-medium">
                              {order.user.phone}
                            </a>
                          </div>
                        )}
                        {order.user?.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-500 w-20">E-posta</span>
                            <span className="text-gray-600">{order.user.email}</span>
                          </div>
                        )}
                        {order.addressText && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{order.addressText}</span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="flex items-start gap-2 text-sm text-gray-500">
                            <span className="font-medium text-gray-400 w-20">Not</span>
                            <span className="italic">"{order.notes}"</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-500 w-20">Tarih</span>
                          <span className="text-gray-600">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sipariş İçeriği</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-300" />
                              <span className="text-gray-700">{item.product?.name}</span>
                              <span className="text-gray-400 bg-gray-100 px-1.5 rounded text-xs">×{item.quantity}</span>
                            </div>
                            <span className="font-medium text-gray-700">
                              {formatPrice(Number(item.product?.price ?? 0) * item.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t flex justify-between font-bold">
                          <span className="text-gray-600">Toplam</span>
                          <span className="text-brand-600 text-base">{formatPrice(Number(order.totalPrice))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2 font-medium">Durum Güncelle:</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.filter((s) => s !== order.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          disabled={updating === order.id}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all disabled:opacity-50 ${STATUS_COLORS[s]}`}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
