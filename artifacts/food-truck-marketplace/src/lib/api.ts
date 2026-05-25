import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";

const API_BASE = import.meta.env.PROD ? "https://aarbty-api.onrender.com" : "";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "provider" | "customer" | "admin";
  phone?: string | null;
}

export async function apiLogin(email: string, password: string): Promise<AuthUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdTokenResult();
  return {
    id: cred.user.uid as unknown as number,
    name: cred.user.displayName ?? email.split("@")[0],
    email: email.toLowerCase(),
    role: (token.claims.role as "provider" | "customer" | "admin") ?? "customer",
    phone: null,
  };
}

export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}): Promise<AuthUser> {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
  await updateProfile(cred.user, { displayName: data.name });

  const token = await cred.user.getIdToken();
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "فشل إنشاء الحساب");
  }

  return res.json();
}

export async function apiLogout(): Promise<void> {
  await signOut(auth);
}

export async function apiMe(): Promise<AuthUser | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const token = await user.getIdTokenResult();
    return {
      id: user.uid as unknown as number,
      name: user.displayName ?? user.email?.split("@")[0] ?? "",
      email: user.email?.toLowerCase() ?? "",
      role: (token.claims.role as "provider" | "customer" | "admin") ?? "customer",
      phone: null,
    };
  } catch {
    return null;
  }
}
