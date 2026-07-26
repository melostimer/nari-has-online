export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    // Güvenlik: kullanıcı yoksa bile başarılı döndür (e-posta sızdırmama)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, user.name, resetUrl);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
