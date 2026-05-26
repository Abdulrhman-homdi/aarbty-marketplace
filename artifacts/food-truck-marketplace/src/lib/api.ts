const API_BASE = import.meta.env.PROD ? "https://aarbty-api.onrender.com" : "";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "provider" | "customer" | "admin";
  phone?: string | null;
}

export interface LoginResponse {
  requiresTwoFactor?: boolean;
  methods?: ("email" | "sms")[];
  requiresEmailVerification?: boolean;
  pendingAuthToken?: string;
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  phone?: string | null;
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
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
}): Promise<LoginResponse> {
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

export async function apiResendVerification(pendingAuthToken?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...(pendingAuthToken ? { pendingAuthToken } : {}) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "فشل إعادة الإرسال");
  }
}

export async function apiVerifyEmail(code: string, pendingAuthToken?: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, ...(pendingAuthToken ? { pendingAuthToken } : {}) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "كود التحقق غير صحيح");
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

export async function apiSendOtp(method: "email" | "sms", pendingAuthToken?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/2fa/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ method, ...(pendingAuthToken ? { pendingAuthToken } : {}) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "فشل إرسال كود التحقق");
  }
}

export async function apiVerifyOtp(code: string, method: "email" | "sms", pendingAuthToken?: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/2fa/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, method, ...(pendingAuthToken ? { pendingAuthToken } : {}) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "كود التحقق غير صحيح");
  }
  return res.json();
}

export async function apiGet2faStatus(): Promise<{ email: boolean; sms: boolean; phone: string | null }> {
  const res = await fetch(`${API_BASE}/api/auth/2fa/status`, { credentials: "include" });
  if (!res.ok) {
    throw new Error("فشل في جلب حالة التحقق الثنائي");
  }
  return res.json();
}

export async function apiToggle2fa(method: "email" | "sms", enabled: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/2fa/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ method, enabled }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "فشل تحديث إعدادات التحقق");
  }
}
