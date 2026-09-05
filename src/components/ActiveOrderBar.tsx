"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Clock, ChefHat, Truck, CheckCircle, XCircle, Package, ChevronRight } from "lucide-react";

type ActiveOrder = {
  id: string;
  status: string;
  updatedAt: string;
  estimatedTime?: number | null;
  createdAt: string;
};

const STATUS_CONFIG: Record<string, {
  label: string;
  shortLabel: string;
  icon: any;
  bg: string;
  text: string;
  border: string;
  dot: string;
  progress: number; // 0-100
  progressColor: string;
}> = {
  PENDING:    {
    label: "Siparişiniz Alındı — Onay bekleniyor 🕐",
    shortLabel: "Alındı 🕐",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
    progress: 20,
    progressColor: "bg-amber-500",
  },
  PREPARING:  {
    label: "Siparişiniz Hazırlanıyor 🍳",
    shortLabel: "Hazırlanıyor 🍳",
    icon: ChefHat,
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    dot: "bg-orange-500",
    progress: 55,
    progressColor: "bg-orange-500",
  },
  ON_THE_WAY: {
    label: "Siparişiniz Yola Çıktı 🛵",
    shortLabel: "Yolda 🛵",
    icon: Truck,
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
    progress: 80,
    progressColor: "bg-blue-500",
  },
  CANCELLED:  {
    label: "Siparişiniz İptal Edildi",
    shortLabel: "İptal",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
    progress: 0,
    progressColor: "bg-red-400",
  },
};

function shortId(id: string) {
  return id.slice(-6).toUpperCase();
}

export function ActiveOrderBar() {
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchActive = useCallback(async () => {
    if (!session?.user) return;
    const role = (session.user as any).role;
    if (role === "ADMIN" || role === "STAFF") return;

    try {
      const res = await fetch("/api/orders/active", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();

        // CANCELLED: hide after 1 hour from updatedAt
        if (data?.status === "CANCELLED") {
          const cancelledAt = new Date(data.updatedAt).getTime();
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - cancelledAt > oneHour) {
            setOrder(null);
            setVisible(false);
            return;
          }
        }

        setOrder(data);
        setVisible(!!data);
      }
    } catch {}
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchActive();
    }
  }, [status, fetchActive]);

  // Poll every 20 seconds
  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(fetchActive, 20000);
    return () => clearInterval(interval);
  }, [status, fetchActive]);

  if (!visible || !order) return null;

  const conf = STATUS_CONFIG[order.status];
  if (!conf) return null;

  const Icon = conf.icon;

  return (
    <div className={`w-full border-b ${conf.bg} ${conf.border}`}>
      <Link
        href={`/orders/${order.id}`}
        className={`flex items-center justify-between max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 ${conf.text} hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          {/* Animated dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${conf.dot} opacity-60`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${conf.dot}`}></span>
          </span>

          {/* Icon + text */}
          <Icon className="w-4 h-4 shrink-0" />
          <span className="font-semibold text-sm hidden sm:inline">{conf.label}</span>
          <span className="font-semibold text-sm sm:hidden">{conf.shortLabel}</span>

          {/* Order number */}
          <span className={`text-xs font-mono hidden sm:inline px-2 py-0.5 rounded-md bg-white/60 border ${conf.border}`}>
            #{shortId(order.id)}
          </span>

          {/* Estimated time */}
          {order.estimatedTime && order.status !== "CANCELLED" && (
            <span className="text-xs hidden md:inline opacity-70">
              ≈ {order.estimatedTime} dk
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium shrink-0">
          <span className="hidden sm:inline">Detayları Gör</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>

      {/* Progress Bar */}
      {order.status !== "CANCELLED" && (
        <div className="h-1 w-full bg-black/5">
          <div
            className={`h-full ${conf.progressColor} transition-all duration-700 ease-in-out`}
            style={{ width: `${conf.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
