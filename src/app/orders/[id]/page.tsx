export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { OrderDetailClient } from "./OrderDetailClient";

export const metadata: Metadata = { title: "Sipariş Takibi" };

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      orderItems: {
        include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } },
      },
    },
  });

  if (!order) notFound();
  if (order.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF") notFound();

  return <OrderDetailClient initialOrder={JSON.parse(JSON.stringify(order))} />;
}
