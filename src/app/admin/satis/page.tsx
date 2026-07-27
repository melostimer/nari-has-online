export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SalesScreenClient } from "./SalesScreenClient";

export const metadata: Metadata = { title: "Satış Ekranı | Admin" };

export default async function SalesScreenPage() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, phone: true, email: true } },
      orderItems: {
        include: { product: { select: { name: true, price: true } } },
      },
    },
  });

  return <SalesScreenClient initialOrders={orders} />;
}
