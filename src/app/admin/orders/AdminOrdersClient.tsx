"use client";

import { useState } from "react";
import { formatPrice, formatDate, shortId, getStatusLabel } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { ChevronDown, RefreshCw } from "lucide-react";

const STATUSES = ["PENDING", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Siparis Alindi", PREPARING: "Hazirlaniyor",
  ON_THE_WAY: "Yola Cikti", DELIVERED: "Teslim Edildi", CANCELLED: "Iptal Et",
};

export function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

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
        <h1 className="font-display text-3xl font-bold text-gray-900">Siparisler</h1>
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
            {s === "ALL" ? "Tumunu Goster" : getStatusLabel(s)}
            {s !== "ALL" && <span className="ml-2 text-xs opacity-70">{orders.filter(o => o.status === s).length}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <p className="text-gray-400">Bu durumda siparis bulunmuyor</p>
          </div>
        ) : filtered.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-gray-900">{shortId(order.id)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm font-medium text-gray-800">{order.user.name}</p>
                <p className="text-xs text-gray-500">{order.user.phone || order.user.email}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-brand-600">{formatPrice(Number(order.totalPrice))}</p>
                <p className="text-xs text-gray-400">{order.orderItems.length} kalem</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-600 mb-1">{order.orderItems.map((i: any) => `${i.product.name} x${i.quantity}`).join(", ")}</p>
              {order.addressText && <p className="text-xs text-gray-400">{order.addressText}</p>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUSES.filter(s => s !== order.status).map((s) => (
                <button key={s} onClick={() => updateStatus(order.id, s)}
                  disabled={updating === order.id}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
