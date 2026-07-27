"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice, formatDate, shortId } from "@/lib/utils";
import { Phone, MapPin, Package, RefreshCw, Clock, CheckCircle, Truck, ChefHat, XCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PENDING:    { label: "Yeni Sipariş",   color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-300", icon: Clock },
  PREPARING:  { label: "Hazırlanıyor",   color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-300",  icon: ChefHat },
  ON_THE_WAY: { label: "Yolda",          color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300",icon: Truck },
  DELIVERED:  { label: "Teslim Edildi",  color: "text-green-700",  bg: "bg-green-50",  border: "border-green-300", icon: CheckCircle },
  CANCELLED:  { label: "İptal",          color: "text-red-700",    bg: "bg-red-50",    border: "border-red-300",   icon: XCircle },
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: "PREPARING",
  PREPARING: "ON_THE_WAY",
  ON_THE_WAY: "DELIVERED",
};

const NEXT_LABEL: Record<string, string> = {
  PENDING: "✓ Hazırlamaya Başla",
  PREPARING: "✓ Yola Çıktı",
  ON_THE_WAY: "✓ Teslim Edildi",
};

export function SalesScreenClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ACTIVE");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders?all=true", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setLastRefresh(new Date());
      }
    } catch {}
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev: any[]) => prev.map((o) => o.id === id ? { ...o, status } : o));
    }
    setUpdating(null);
  };

  const cancelOrder = async (id: string) => {
    if (!confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) return;
    await updateStatus(id, "CANCELLED");
  };

  const filteredOrders = orders.filter((o: any) => {
    if (filter === "ACTIVE") return ["PENDING", "PREPARING", "ON_THE_WAY"].includes(o.status);
    if (filter === "DELIVERED") return o.status === "DELIVERED";
    if (filter === "CANCELLED") return o.status === "CANCELLED";
    return true;
  });

  // Group active orders by status for priority display
  const pending   = filteredOrders.filter((o: any) => o.status === "PENDING");
  const preparing = filteredOrders.filter((o: any) => o.status === "PREPARING");
  const onTheWay  = filteredOrders.filter((o: any) => o.status === "ON_THE_WAY");
  const others    = filteredOrders.filter((o: any) => !["PENDING","PREPARING","ON_THE_WAY"].includes(o.status));

  const displayOrders = filter === "ACTIVE"
    ? [...pending, ...preparing, ...onTheWay]
    : filteredOrders;

  const totalRevenue = orders
    .filter((o: any) => o.status !== "CANCELLED")
    .reduce((sum: number, o: any) => sum + Number(o.totalPrice), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white tracking-wide">🍽️ Satış Ekranı</h1>
            <div className="flex gap-3 text-sm">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-medium">
                {pending.length} Yeni
              </span>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-medium">
                {preparing.length} Hazırlanıyor
              </span>
              <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full font-medium">
                {onTheWay.length} Yolda
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Toplam Ciro</p>
              <p className="text-lg font-bold text-green-400">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Son Güncelleme</p>
              <p className="text-sm text-gray-300">{lastRefresh.toLocaleTimeString("tr-TR")}</p>
            </div>
            <button
              onClick={() => { fetchOrders(); }}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                autoRefresh ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-800 text-gray-400"
              }`}
            >
              {autoRefresh ? "⚡ Otomatik" : "Manuel"}
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { key: "ACTIVE", label: "Aktif Siparişler" },
            { key: "DELIVERED", label: "Teslim Edilenler" },
            { key: "CANCELLED", label: "İptal Edilenler" },
            { key: "ALL", label: "Tümü" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-brand-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-6">
        {displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-lg font-medium">Sipariş bulunmuyor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayOrders.map((order: any) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              const nextStatus = NEXT_STATUS[order.status];
              const isUpdating = updating === order.id;

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-all ${cfg.border} ${
                    order.status === "PENDING" ? "ring-2 ring-amber-400/40 shadow-amber-900/20 shadow-lg" : ""
                  }`}
                  style={{ backgroundColor: "rgb(17 24 39)" }}
                >
                  {/* Card Header */}
                  <div className={`px-5 py-3 flex items-center justify-between ${cfg.bg} ${cfg.border} border-b`}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                      <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-mono">#{shortId(order.id)}</span>
                      <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Customer */}
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-white">{order.user?.name || "—"}</p>
                      {order.user?.phone && (
                        <a
                          href={`tel:${order.user.phone}`}
                          className="flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          {order.user.phone}
                        </a>
                      )}
                      {order.addressText && (
                        <div className="flex items-start gap-2 text-sm text-gray-400">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
                          <span>{order.addressText}</span>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-800" />

                    {/* Order items */}
                    <div className="space-y-2">
                      {order.orderItems?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Package className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                            <span>{item.product?.name}</span>
                            <span className="text-gray-600 bg-gray-800 px-1.5 rounded text-xs">×{item.quantity}</span>
                          </div>
                          <span className="text-gray-400 text-xs">
                            {formatPrice(Number(item.product?.price ?? 0) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {order.note && (
                      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2">
                        <p className="text-xs text-yellow-400 font-medium">Not: {order.note}</p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm text-gray-500">Toplam</span>
                      <span className="text-xl font-bold text-white">{formatPrice(Number(order.totalPrice))}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      {nextStatus && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus)}
                          disabled={isUpdating}
                          className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
                        >
                          {isUpdating ? "..." : NEXT_LABEL[order.status]}
                        </button>
                      )}
                      {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          disabled={isUpdating}
                          className="px-3 py-2.5 bg-gray-800 hover:bg-red-900/40 disabled:opacity-60 text-gray-400 hover:text-red-400 text-sm rounded-xl transition-colors border border-gray-700"
                          title="İptal Et"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
