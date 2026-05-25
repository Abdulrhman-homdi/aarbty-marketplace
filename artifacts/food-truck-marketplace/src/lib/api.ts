const API_BASE = import.meta.env.PROD ? "https://aarbty-api.onrender.com" : "";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "provider" | "customer" | "admin";
  phone?: string | null;
}

export async function apiLogin(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "فشل تسجيل الدخول");
  }
  return res.json();
}

export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "فشل إنشاء الحساب");
  }
  return res.json();
}

export async function apiLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
}

export async function apiMe(): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}
