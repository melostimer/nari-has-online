import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminCategoriesClient } from "./AdminCategoriesClient";

export const metadata: Metadata = { title: "Kategoriler | Admin" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return <AdminCategoriesClient initialCategories={categories} />;
}
