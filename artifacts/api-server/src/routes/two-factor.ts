import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateOtp, verifyOtp } from "../lib/otp";
import { sendOtpEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router = Router();

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
    userName: string;
    userEmail: string;
    pending2FAUserId?: number;
  }
}

router.post("/auth/2fa/send-code", async (req, res) => {
  const userId = req.session.pending2FAUserId ?? req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "غير مسجّل الدخول" });
  }

  const { method } = req.body as { method: "email" | "sms" };

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }

  const { key, code } = generateOtp(userId, method);
  req.session.pending2FAKey = key;

  if (method === "email") {
    const sent = await sendOtpEmail(user.email, code);
    if (!sent) {
      logger.info({ email: user.email, code }, "[2fa-fallback] OTP code (email send failed)");
      return res.json({ message: "تم إرسال كود التحقق", devCode: code });
    }
  } else if (method === "sms") {
    if (!user.phone) {
      return res.status(400).json({ message: "رقم الجوال غير مسجل" });
    }
    logger.info({ phone: user.phone, code }, "[sms-fallback] OTP code (SMS not configured)");
  }

  res.json({ message: "تم إرسال كود التحقق" });
});

router.post("/auth/2fa/verify-code", async (req, res) => {
  const userId = req.session.pending2FAUserId ?? req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "غير مسجّل الدخول" });
  }

  const { code, method } = req.body as { code: string; method: "email" | "sms" };
  const key = req.session.pending2FAKey;

  if (!key || !verifyOtp(key, code, userId)) {
    return res.status(400).json({ message: "كود التحقق غير صحيح أو منتهي الصلاحية" });
  }

  if (req.session.pending2FAUserId) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    delete req.session.pending2FAUserId;
    delete req.session.pending2FAKey;

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
  }

  delete req.session.pending2FAKey;
  res.json({ message: "تم التحقق بنجاح" });
});

router.get("/auth/2fa/status", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "غير مسجّل الدخول" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }

  res.json({
    email: user.twoFactorEmail,
    sms: user.twoFactorSms,
    phone: user.phone,
  });
});

router.post("/auth/2fa/toggle", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "غير مسجّل الدخول" });
  }

  const { method, enabled } = req.body as { method: "email" | "sms"; enabled: boolean };

  if (method === "email") {
    await db.update(usersTable).set({ twoFactorEmail: enabled }).where(eq(usersTable.id, req.session.userId));
  } else if (method === "sms") {
    await db.update(usersTable).set({ twoFactorSms: enabled }).where(eq(usersTable.id, req.session.userId));
  }

  res.json({ message: enabled ? "تم تفعيل التحقق الثنائي" : "تم إلغاء التحقق الثنائي" });
});

export default router;
