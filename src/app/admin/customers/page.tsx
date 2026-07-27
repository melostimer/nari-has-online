export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./CustomersClient";

export const metadata: Metadata = { title: "Kullanıcılar | Admin" };

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        select: { totalPrice: true },
        where: { status: { not: "CANCELLED" } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <CustomersClient initialUsers={users} />;
}
