import type { Request, Response, NextFunction } from "express";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (getApps().length === 0) {
  initializeApp({
    projectId: "aarbty-marketplace-2d1d4",
  });
}

export async function firebaseAuthMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(token);

    if (!req.session) {
      req.session = {} as any;
    }

    req.session.userId = decoded.uid as unknown as number;
    req.session.userRole = (decoded.role as string) ?? "customer";
    req.session.userName = decoded.name ?? decoded.email?.split("@")[0] ?? "User";
    req.session.userEmail = decoded.email ?? "";
  } catch {
    // Token invalid, continue without Firebase auth
  }
  next();
}
