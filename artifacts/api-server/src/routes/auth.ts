import { Router } from "express";
import bcrypt from "bcryptjs";
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
    pending2FAKey?: string;
    pendingEmailVerifyUserId?: number;
    pendingEmailVerifyKey?: string;
    pendingEmailVerifyTimer?: number;
  }
}

router.post("/auth/register", async (req, res) => {
  const { name, email, password, role, phone } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ message: "الاسم والبريد وكلمة المرور مطلوبة" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role ?? "customer",
      phone: phone ?? null,
      emailVerified: false,
    })
    .returning();

  // Generate and send verification OTP
  const { key, code } = generateOtp(user.id, "email");
  req.session.pendingEmailVerifyKey = key;
  req.session.pendingEmailVerifyUserId = user.id;
  req.session.pendingEmailVerifyTimer = Date.now();

  const sent = await sendOtpEmail(user.email, code);
  if (!sent) {
    logger.info({ email: user.email, code }, "[email-verify] OTP (email not configured)");
  }

  return res.status(201).json({ requiresEmailVerification: true });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ message: "البريد وكلمة المرور مطلوبان" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

  if (!user) {
    return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ message: "الرجاء تأكيد البريد الإلكتروني أولاً عبر كود التحقق المرسل لبريدك" });
  }

  // Always require email OTP on every login
  req.session.pending2FAUserId = user.id;
  const methods: ("email" | "sms")[] = ["email"];
  if (user.phone) methods.push("sms");
  return res.json({ requiresTwoFactor: true, methods });

  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.userName = user.name;
  req.session.userEmail = user.email;

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.json({ message: "تم تسجيل الخروج" });
  });
});

router.post("/auth/resend-verification", async (req, res) => {
  const userId = req.session.pendingEmailVerifyUserId;
  if (!userId) {
    return res.status(400).json({ message: "لا يوجد طلب تسجيل معلق" });
  }

  // Rate limit - wait 30s between resends
  if (req.session.pendingEmailVerifyTimer && Date.now() - req.session.pendingEmailVerifyTimer < 30000) {
    return res.status(429).json({ message: "الرجاء الانتظار 30 ثانية قبل إعادة الإرسال" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || user.emailVerified) {
    return res.status(400).json({ message: "الحساب مُفعّل مسبقاً" });
  }

  const { key, code } = generateOtp(userId, "email");
  req.session.pendingEmailVerifyKey = key;
  req.session.pendingEmailVerifyTimer = Date.now();

  const sent = await sendOtpEmail(user.email, code);
  if (!sent) {
    logger.info({ email: user.email, code }, "[email-verify] resend OTP (email not configured)");
  }

  res.json({ message: "تم إرسال كود التحقق" });
});

router.post("/auth/verify-email", async (req, res) => {
  const userId = req.session.pendingEmailVerifyUserId;
  if (!userId) {
    return res.status(400).json({ message: "لا يوجد طلب تسجيل معلق" });
  }

  const { code } = req.body as { code: string };
  if (!code) {
    return res.status(400).json({ message: "كود التحقق مطلوب" });
  }

  const key = req.session.pendingEmailVerifyKey;
  if (!key || !verifyOtp(key, code, userId)) {
    return res.status(400).json({ message: "كود التحقق غير صحيح أو منتهي الصلاحية" });
  }

  const [user] = await db.update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }

  // Log the user in
  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.userName = user.name;
  req.session.userEmail = user.email;
  delete req.session.pendingEmailVerifyUserId;
  delete req.session.pendingEmailVerifyKey;
  delete req.session.pendingEmailVerifyTimer;

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  });
});

router.get("/auth/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "غير مسجّل الدخول" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, req.session.userEmail!)).limit(1);
  if (!user) {
    return res.status(401).json({ message: "المستخدم غير موجود" });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  });
});

export default router;
