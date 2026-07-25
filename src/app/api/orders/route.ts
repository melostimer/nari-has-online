import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createOrderSchema = z.object({
  addressText: z.string().min(10, "Adres en az 10 karakter olmalıdır"),
  paymentMethod: z.enum(["CASH", "CARD"]),
  note: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ).min(1, "Sepet boş olamaz"),
});

// Kullanıcının kendi siparislerini getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Giriş yapınız" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Siparisler alınamadı" }, { status: 500 });
  }
}

// Yeni siparis ver
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Sipariş vermek için giriş yapın" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { addressText, paymentMethod, note, items } = parsed.data;

    // Ürün fiyatlarını veritabanından al (client'a güvenme)
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Bazı ürünler mevcut değil" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalPrice = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      totalPrice += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId,
        addressText,
        paymentMethod,
        note,
        totalPrice,
        estimatedTime: 45,
        orderItems: { create: orderItems },
      },
      include: {
        orderItems: { include: { product: { select: { name: true } } } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
  }
}
