import nodemailer from "nodemailer";
import { promises as dns } from "dns";
import { logger } from "./logger";

let transporterPromise: Promise<nodemailer.Transporter | null> | null = null;

async function createTransporter(): Promise<nodemailer.Transporter | null> {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    logger.warn("EMAIL_HOST/EMAIL_USER/EMAIL_PASS not set – email 2FA disabled");
    return null;
  }

  // Resolve hostname to IPv4 (Render doesn't support IPv6 outbound)
  let ipAddress = host;
  try {
    const { address } = await dns.lookup(host, { family: 4 });
    ipAddress = address;
  } catch {
    logger.warn({ host }, "DNS resolution failed, using hostname as-is");
  }

  const t = nodemailer.createTransport({
    host: ipAddress,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });

  // Verify the connection configuration on creation
  try {
    await t.verify();
    logger.info("SMTP connection verified");
  } catch (err) {
    logger.warn({ err }, "SMTP connection verification failed, will try on send");
  }

  return t;
}

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporterPromise) return transporterPromise;
  transporterPromise = createTransporter();
  return transporterPromise;
}

export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  const t = await getTransporter();
  if (!t) {
    logger.info({ to, code }, "[email-fallback] OTP code (email not configured)");
    return true;
  }

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
      to,
      subject: "كود التحقق - عربتي",
      html: `
        <div dir="rtl" style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="text-align: center; padding: 24px 0;">
            <h1 style="margin: 0; font-size: 24px;">عربتي</h1>
            <p style="color: #666;">سوق عربات الفود ترك</p>
          </div>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="font-size: 16px; margin: 0 0 16px;">كود التحقق الخاص بك</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000; background: #fff; border-radius: 8px; padding: 16px; margin: 0 0 16px;">
              ${code}
            </div>
            <p style="font-size: 13px; color: #999; margin: 0;">الكود صالح لمدة 10 دقائق</p>
          </div>
        </div>
      `,
    });
    logger.info({ to }, "OTP email sent successfully");
    return true;
  } catch (err) {
    logger.error({ err, to }, "Failed to send OTP email");
    return false;
  }
}
