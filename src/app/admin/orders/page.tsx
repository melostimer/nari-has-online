export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminOrdersClient } from "./AdminOrdersClient";

export const metadata: Metadata = { title: "Siparisler | Admin" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      orderItems: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return <AdminOrdersClient initialOrders={orders} />;
}
