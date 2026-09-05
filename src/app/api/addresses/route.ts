export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const addressSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur").max(50),
  addressText: z.string().min(10, "Adres en az 10 karakter olmalıdır"),
  district: z.string().optional(),
  note: z.string().optional(),
});

// Kullanıcının kayıtlı adreslerini getir
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapınız" }, { status: 401 });
  const userId = (session.user as any).id;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(addresses);
}

// Yeni adres kaydet
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapınız" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      title: parsed.data.title,
      addressText: parsed.data.addressText,
      district: parsed.data.district,
      note: parsed.data.note,
    },
  });

  return NextResponse.json(address, { status: 201 });
}
