import crypto from "crypto";

interface PendingAuthEntry {
  userId: number;
  otpKey?: string;
}

const store = new Map<string, PendingAuthEntry>();

const TTL_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, _] of store) {
  }
}, 60_000);

export function createPendingAuthToken(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  store.set(token, { userId });
  setTimeout(() => store.delete(token), TTL_MS);
  return token;
}

export function setPendingAuthOtpKey(token: string, otpKey: string): void {
  const entry = store.get(token);
  if (entry) {
    entry.otpKey = otpKey;
  }
}

export function consumePendingAuthToken(token: string): { userId: number; otpKey?: string } | null {
  const entry = store.get(token) ?? null;
  if (entry !== null) {
    store.delete(token);
  }
  return entry;
}

export function peekPendingAuthToken(token: string): { userId: number; otpKey?: string } | null {
  return store.get(token) ?? null;
}
