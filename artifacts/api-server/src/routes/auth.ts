import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
    userName: string;
    userEmail: string;
    pending2FAUserId?: number;
    pending2FAKey?: string;
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
    })
    .returning();

  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.userName = user.name;
  req.session.userEmail = user.email;

  return res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  });
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

  if (user.twoFactorEmail || user.twoFactorSms) {
    req.session.pending2FAUserId = user.id;
    const methods: ("email" | "sms")[] = [];
    if (user.twoFactorEmail) methods.push("email");
    if (user.twoFactorSms) methods.push("sms");
    return res.json({ requiresTwoFactor: true, methods });
  }

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
