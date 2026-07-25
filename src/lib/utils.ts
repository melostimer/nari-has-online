import { type ClassValue, clsx } from "clsx";

/** Tailwind class birleştirici */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

/** Türk lirası formatı */
export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/** Sipariş durumu Türkçe label */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Sipariş Alındı",
    PREPARING: "Hazırlanıyor",
    ON_THE_WAY: "Yola Çıktı",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
  };
  return labels[status] ?? status;
}

/** Sipariş durumu renk sınıfı */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PREPARING: "bg-blue-100 text-blue-800",
    ON_THE_WAY: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800";
}

/** Ödeme yöntemi Türkçe label */
export function getPaymentLabel(method: string): string {
  const labels: Record<string, string> = {
    CASH: "Kapıda Nakit",
    CARD: "Kapıda Kart",
  };
  return labels[method] ?? method;
}

/** Tarihi Türkçe formatla */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Sipariş ID kısalt */
export function shortId(id: string): string {
  return "#" + id.slice(-6).toUpperCase();
}
