import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: decoded.name ?? decoded.email?.split("@")[0] ?? "User",
      role: (decoded.role as string) ?? "customer",
    };
  } catch {
    // Token invalid, continue without user
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: "غير مسجّل الدخول" });
    return;
  }
  next();
}
