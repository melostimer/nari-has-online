import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatPrice, formatDate, shortId, getPaymentLabel } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { CheckCircle, Clock, MapPin, CreditCard, Package } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Siparis Durumu" };

const STATUS_STEPS = ["PENDING", "PREPARING", "ON_THE_WAY", "DELIVERED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Siparis Alindi", PREPARING: "Hazirlaniyor",
  ON_THE_WAY: "Yola Cikti", DELIVERED: "Teslim Edildi",
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { orderItems: { include: { product: true } } },
  });

  if (!order) notFound();
  if (order.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") notFound();

  const currentStep = order.status === "CANCELLED" ? -1 : STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="section-container max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Siparis Durumu</h1>
            <p className="text-gray-500 mt-1">Siparis {shortId(order.id)} - {formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} className="text-sm px-4 py-2" />
        </div>

        {/* Status Timeline */}
        {order.status !== "CANCELLED" && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-brand-500" />
              <h2 className="font-semibold text-gray-900">Siparis Takibi</h2>
              {order.estimatedTime && (
                <span className="ml-auto text-sm text-gray-500">Tahmini: ~{order.estimatedTime} dk</span>
              )}
            </div>
            <div className="relative">
              <div className="flex justify-between">
                {STATUS_STEPS.map((step, i) => {
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 relative bg-white ${
                        done ? "border-green-500 bg-green-500" : active ? "border-brand-500 bg-brand-500" : "border-gray-200"
                      }`}>
                        {done ? <CheckCircle className="h-5 w-5 text-white" /> : (
                          <span className={`text-xs font-bold ${active ? "text-white" : "text-gray-400"}`}>{i + 1}</span>
                        )}
                      </div>
                      <p className={`text-xs mt-2 text-center font-medium ${
                        done || active ? "text-gray-900" : "text-gray-400"
                      }`}>{STATUS_LABELS[step]}</p>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-5"><Package className="h-5 w-5 text-brand-500" /><h2 className="font-semibold text-gray-900">Siparis Detayi</h2></div>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} x {formatPrice(Number(item.unitPrice))}</p>
                </div>
                <span className="font-semibold text-gray-900">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 mt-2 border-t">
            <span className="font-bold text-gray-900">Toplam</span>
            <span className="text-xl font-bold text-brand-600">{formatPrice(Number(order.totalPrice))}</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-3"><MapPin className="h-4 w-4 text-brand-500" /><h3 className="font-semibold text-sm text-gray-900">Teslimat Adresi</h3></div>
            <p className="text-sm text-gray-600">{order.addressText}</p>
            {order.note && <p className="text-xs text-gray-400 mt-2">Not: {order.note}</p>}
          </div>
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-3"><CreditCard className="h-4 w-4 text-brand-500" /><h3 className="font-semibold text-sm text-gray-900">Odeme</h3></div>
            <p className="text-sm text-gray-600">{getPaymentLabel(order.paymentMethod)}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/profile" className="flex-1 text-center py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">Tum Siparislerim</Link>
          <Link href="/menu" className="flex-1 text-center py-3 bg-brand-gradient text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">Tekrar Siparis Ver</Link>
        </div>
      </div>
    </div>
  );
}
