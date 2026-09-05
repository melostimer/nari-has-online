export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createOrderSchema = z.object({
  addressText: z.string().min(10, "Adres en az 10 karakter olmalıdır").optional(),
  addressId: z.string().optional(),
  paymentMethod: z.enum(["CASH", "CARD"]),
  note: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ).min(1, "Sepet boş olamaz"),
}).refine(data => data.addressText || data.addressId, {
  message: "Teslimat adresi zorunludur",
  path: ["addressText"],
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

    const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });
    if (settings) {
      if (!settings.isOrderingEnabled) {
        return NextResponse.json({ error: "Şu an geçici olarak sipariş alımımız kapalıdır." }, { status: 400 });
      }

      const now = new Date();
      const turkeyTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
      const currentTotalMinutes = turkeyTime.getHours() * 60 + turkeyTime.getMinutes();

      const parseTime = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };

      const startMinutes = parseTime(settings.orderStartTime);
      const endMinutes = parseTime(settings.orderEndTime);

      let isWithinHours = false;
      if (startMinutes <= endMinutes) {
        isWithinHours = currentTotalMinutes >= startMinutes && currentTotalMinutes <= endMinutes;
      } else {
        // Example: 11:00 to 02:00 (next day)
        isWithinHours = currentTotalMinutes >= startMinutes || currentTotalMinutes <= endMinutes;
      }

      if (!isWithinHours) {
        return NextResponse.json({ error: `Şu an paket servis saatleri dışındayız (${settings.orderStartTime} - ${settings.orderEndTime})` }, { status: 400 });
      }
    }

    const { addressText: rawAddressText, addressId, paymentMethod, note, items } = parsed.data;

    let finalAddressText = rawAddressText;
    let finalAddressId = addressId;

    // Kayıtlı adres seçildiyse veritabanından doğrula ve metnini al
    if (addressId) {
      const savedAddr = await prisma.address.findFirst({
        where: { id: addressId, userId },
      });
      if (!savedAddr) {
        return NextResponse.json({ error: "Seçilen adres bulunamadı" }, { status: 400 });
      }
      finalAddressText = savedAddr.addressText;
      finalAddressId = savedAddr.id;
    }

    if (!finalAddressText) {
      return NextResponse.json({ error: "Teslimat adresi zorunludur" }, { status: 400 });
    }

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
        addressText: finalAddressText,
        addressId: finalAddressId,
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
