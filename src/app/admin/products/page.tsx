import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminProductsClient } from "./AdminProductsClient";

export const metadata: Metadata = { title: "Urun Yonetimi | Admin" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  return <AdminProductsClient initialProducts={products} categories={categories} />;
}
