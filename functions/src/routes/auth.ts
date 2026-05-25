import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { firestoreDb } from "../db.js";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "الاسم والبريد وكلمة المرور مطلوبة" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const userRecord = await getAuth().createUser({
      email: email.toLowerCase(),
      password,
      displayName: name,
    });

    await getAuth().setCustomUserClaims(userRecord.uid, { role: role ?? "customer" });

    await firestoreDb.create("users", {
      uid: userRecord.uid,
      name,
      email: email.toLowerCase(),
      role: role ?? "customer",
      phone: phone ?? null,
    });

    const token = await getAuth().createCustomToken(userRecord.uid);

    return res.status(201).json({
      id: userRecord.uid,
      name,
      email: email.toLowerCase(),
      role: role ?? "customer",
      phone: phone ?? null,
      token,
    });
  } catch (err: any) {
    if (err.code === "auth/email-already-exists") {
      return res.status(409).json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
    }
    return res.status(500).json({ message: "خطأ في التسجيل", error: err.message });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "البريد وكلمة المرور مطلوبان" });
    }

    const userRecord = await getAuth().getUserByEmail(email.toLowerCase());
    if (!userRecord) {
      return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    const token = await getAuth().createCustomToken(userRecord.uid);
    const claims = userRecord.customClaims ?? {};

    return res.json({
      id: userRecord.uid,
      name: userRecord.displayName ?? email.split("@")[0],
      email: email.toLowerCase(),
      role: claims.role ?? "customer",
      phone: null,
      token,
    });
  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }
    return res.status(500).json({ message: "خطأ في تسجيل الدخول", error: err.message });
  }
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مسجّل الدخول" });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = await getAuth().verifyIdToken(token);
    const userRecord = await getAuth().getUser(decoded.uid);

    return res.json({
      id: userRecord.uid,
      name: userRecord.displayName ?? "",
      email: userRecord.email ?? "",
      role: (userRecord.customClaims?.role as string) ?? "customer",
      phone: null,
    });
  } catch {
    return res.status(401).json({ message: "غير مسجّل الدخول" });
  }
});

export default router;
