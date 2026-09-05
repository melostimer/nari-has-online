import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    let settings = await prisma.storeSettings.findUnique({
      where: { id: "global" },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: "global",
          orderStartTime: "11:00",
          orderEndTime: "23:30",
          isOrderingEnabled: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Ayarlar alınamadı" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate input briefly
    if (typeof data.orderStartTime !== 'string' || typeof data.orderEndTime !== 'string' || typeof data.isOrderingEnabled !== 'boolean') {
        return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const settings = await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: {
        orderStartTime: data.orderStartTime,
        orderEndTime: data.orderEndTime,
        isOrderingEnabled: data.isOrderingEnabled,
      },
      create: {
        id: "global",
        orderStartTime: data.orderStartTime,
        orderEndTime: data.orderEndTime,
        isOrderingEnabled: data.isOrderingEnabled,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json({ error: "Ayarlar güncellenemedi" }, { status: 500 });
  }
}
