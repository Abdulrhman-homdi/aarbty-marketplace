import { type Request, type Response, type NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.userId) {
      res.status(401).json({ message: "غير مسجّل الدخول" });
      return;
    }
    if (roles.length > 0 && !roles.includes(req.session.userRole ?? "")) {
      res.status(403).json({ message: "ليس لديك صلاحية للوصول" });
      return;
    }
    next();
  };
}
