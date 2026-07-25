export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MenuClient } from "./MenuClient";

export const metadata: Metadata = {
  title: "Menu",
  description: "Nar-i Has tum menu - Baslangiclар, Ana Yemekler, Pideler, Tatlilar ve Icecekler",
};

export default async function MenuPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
    }),
    prisma.product.findMany({
      where: { isAvailable: true },
      include: { category: { select: { id: true, name: true, emoji: true } } },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    }),
  ]);

  return <MenuClient categories={categories} products={products} />;
}
