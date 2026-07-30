import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"Nar-ı Has" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Şifre Sıfırlama — Nar-ı Has",
    html: `
      <!DOCTYPE html>
      <html lang="tr">
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:'Georgia',serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:#1a0a00;padding:32px 40px;text-align:center;">
                  <h1 style="color:#c59e67;font-size:28px;margin:0;letter-spacing:0.1em;">Nar-ı Has</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 40px 32px;">
                  <p style="color:#374151;font-size:16px;margin:0 0 8px;">Merhaba, <strong>${name}</strong></p>
                  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 32px;">
                    Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
                  </p>
                  <div style="text-align:center;margin:0 0 32px;">
                    <a href="${resetUrl}" style="display:inline-block;background:#9b1c1c;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:bold;letter-spacing:0.05em;">
                      Şifremi Sıfırla
                    </a>
                  </div>
                  <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">
                    Bu bağlantı <strong>1 saat</strong> süreyle geçerlidir. Eğer bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f5f0;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="color:#9ca3af;font-size:12px;margin:0;">© 2025 Nar-ı Has — Tüm hakları saklıdır.</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
}
