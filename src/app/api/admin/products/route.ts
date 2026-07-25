import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { z } from "zod";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

const productSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçin"),
  name: z.string().min(2, "Ürün adı gerekli"),
  description: z.string().optional(),
  price: z.number().positive("Fiyat pozitif olmalı"),
  imageBase64: z.string().optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  order: z.number().default(0),
});

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    });
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: "Rürunler alınamadı" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    let { imageBase64, imageUrl, ...data } = parsed.data;

    // Eğer base64 görsel gönderildiyse Cloudinary'e yükle
    if (imageBase64) {
      imageUrl = await uploadImage(imageBase64);
    }

    const product = await prisma.product.create({
      data: { ...data, imageUrl },
      include: { category: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Rürun eklenemedi" }, { status: 500 });
  }
}
