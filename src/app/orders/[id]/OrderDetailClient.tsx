"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Clock, ChefHat, Truck, CheckCircle, XCircle,
  MapPin, CreditCard, Banknote, Package, RefreshCw, AlertCircle
} from "lucide-react";
import { formatPrice, formatDate, shortId, getPaymentLabel } from "@/lib/utils";

type Order = {
  id: string;
  status: string;
  paymentMethod: string;
  totalPrice: number;
  note?: string | null;
  addressText?: string | null;
  estimatedTime?: number | null;
  createdAt: string;
  updatedAt: string;
  orderItems: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { id: string; name: string; imageUrl?: string | null; price: number };
  }[];
};

const STATUS_STEPS: { key: string; label: string; icon: any; color: string; bg: string }[] = [
  { key: "PENDING",    label: "Sipariş Alındı",   icon: Clock,        color: "text-amber-600",  bg: "bg-amber-500" },
  { key: "PREPARING",  label: "Hazırlanıyor",      icon: ChefHat,      color: "text-orange-600", bg: "bg-orange-500" },
  { key: "ON_THE_WAY", label: "Yola Çıktı",        icon: Truck,        color: "text-blue-600",   bg: "bg-blue-500" },
  { key: "DELIVERED",  label: "Teslim Edildi",     icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-500" },
];

const STATUS_BAR_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PENDING:    { label: "Siparişiniz Alındı — Onay bekleniyor",  bg: "bg-amber-50",  text: "text-amber-800",  border: "border-amber-200" },
  PREPARING:  { label: "Siparişiniz Hazırlanıyor 🍳",            bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  ON_THE_WAY: { label: "Siparişiniz Yola Çıktı 🛵",              bg: "bg-blue-50",   text: "text-blue-800",   border: "border-blue-200" },
  DELIVERED:  { label: "Siparişiniz Teslim Edildi ✅",            bg: "bg-green-50",  text: "text-green-800",  border: "border-green-200" },
  CANCELLED:  { label: "Siparişiniz İptal Edildi",               bg: "bg-red-50",    text: "text-red-800",    border: "border-red-200" },
};

export function OrderDetailClient({ initialOrder }: { initialOrder: Order }) {
  const [order, setOrder] = useState(initialOrder);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${initialOrder.id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setLastRefresh(new Date());
      }
    } catch {}
  }, [initialOrder.id]);

  // Poll every 20 seconds while not finished
  useEffect(() => {
    if (order.status === "DELIVERED" || order.status === "CANCELLED") return;
    const interval = setInterval(fetchOrder, 20000);
    return () => clearInterval(interval);
  }, [order.status, fetchOrder]);

  const currentStepIdx = order.status === "CANCELLED" ? -1 : STATUS_STEPS.findIndex(s => s.key === order.status);
  const barConf = STATUS_BAR_CONFIG[order.status] || STATUS_BAR_CONFIG.PENDING;
  const isCancelled = order.status === "CANCELLED";
  const isFinished = order.status === "DELIVERED" || order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Banner */}
      <div className={`border-b ${barConf.bg} ${barConf.border}`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {isCancelled ? (
            <XCircle className={`w-5 h-5 shrink-0 ${barConf.text}`} />
          ) : (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {!isFinished && <span className={`animate-ping absolute h-full w-full rounded-full ${currentStepIdx >= 0 ? STATUS_STEPS[currentStepIdx].bg : "bg-gray-400"} opacity-60`}></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentStepIdx >= 0 ? STATUS_STEPS[currentStepIdx].bg : "bg-gray-400"}`}></span>
            </span>
          )}
          <span className={`font-semibold text-sm ${barConf.text}`}>{barConf.label}</span>
          {!isFinished && (
            <button onClick={fetchOrder} className={`ml-auto p-1 rounded-lg hover:bg-white/50 ${barConf.text} opacity-60 hover:opacity-100 transition-opacity`} title="Yenile">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Sipariş Takibi</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {shortId(order.id)} · {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">Sipariş Durumu</h2>
              {order.estimatedTime && (
                <span className="text-sm text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                  ~{order.estimatedTime} dk tahmini
                </span>
              )}
            </div>

            {/* Vertical Steps */}
            <div className="relative pl-6">
              {/* Connector Line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100" />

              <div className="space-y-6">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i < currentStepIdx;
                  const isActive = i === currentStepIdx;
                  const isPending = i > currentStepIdx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      {/* Circle */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all duration-500 ${
                        isDone  ? `${step.bg} border-transparent` :
                        isActive ? `${step.bg} border-transparent shadow-lg ring-4 ring-offset-1 ring-${step.bg.replace("bg-", "")}/30` :
                        "bg-white border-gray-200"
                      }`}>
                        {isDone || isActive ? (
                          <Icon className="w-4 h-4 text-white" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-200" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 pb-1 ${isPending ? "opacity-40" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold text-sm ${isActive ? step.color : isDone ? "text-gray-700" : "text-gray-400"}`}>
                            {step.label}
                          </span>
                          {isActive && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${step.bg} bg-opacity-10 ${step.color}`}>
                              Şu an burada
                            </span>
                          )}
                          {isDone && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {isActive && order.estimatedTime && i === 1 && (
                          <p className="text-xs text-gray-400 mt-0.5">Yaklaşık {order.estimatedTime} dakika</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800">Siparişiniz İptal Edildi</p>
              <p className="text-sm text-red-600 mt-0.5">Ödeme tahsil edilmedi. Tekrar sipariş verebilirsiniz.</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <Package className="w-5 h-5 text-brand-500" /> Sipariş İçeriği
          </h2>
          <div className="space-y-4">
            {order.orderItems.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                  {item.product.imageUrl ? (
                    <Image src={item.product.imageUrl} alt={item.product.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-sm text-gray-400">{item.quantity} adet × {formatPrice(Number(item.unitPrice))}</p>
                </div>
                <span className="font-semibold text-gray-900 shrink-0">
                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Toplam</span>
            <span className="text-xl font-bold text-brand-600">{formatPrice(Number(order.totalPrice))}</span>
          </div>
        </div>

        {/* Delivery & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3 text-sm">
              <MapPin className="w-4 h-4 text-brand-500" /> Teslimat Adresi
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{order.addressText || "—"}</p>
            {order.note && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 font-medium">Sipariş Notu</p>
                <p className="text-sm text-amber-800 mt-0.5">{order.note}</p>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3 text-sm">
              <CreditCard className="w-4 h-4 text-brand-500" /> Ödeme
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                {order.paymentMethod === "CARD" ? (
                  <CreditCard className="w-5 h-5 text-blue-500" />
                ) : (
                  <Banknote className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{getPaymentLabel(order.paymentMethod)}</p>
                <p className="text-xs text-gray-400">Teslimatta ödeme</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <Link
            href="/profile"
            className="flex-1 text-center py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Tüm Siparişlerim
          </Link>
          <Link
            href="/menu"
            className="flex-1 text-center py-3.5 bg-brand-gradient text-white rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            Tekrar Sipariş Ver
          </Link>
        </div>

        {/* Auto-refresh hint */}
        {!isFinished && (
          <p className="text-center text-xs text-gray-400 pb-4">
            Sayfa her 20 saniyede bir otomatik güncellenir · Son güncelleme: {lastRefresh.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}
