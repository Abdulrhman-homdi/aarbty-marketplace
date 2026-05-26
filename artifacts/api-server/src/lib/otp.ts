import crypto from "crypto";

interface OtpEntry {
  code: string;
  userId: number;
  method: "email" | "sms";
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OtpEntry>();

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key);
  }
}, 60_000);

export function generateOtp(userId: number, method: "email" | "sms"): { key: string; code: string } {
  const code = crypto.randomInt(100000, 999999).toString();
  const key = `${userId}:${method}:${code}`;
  store.set(key, { code, userId, method, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
  return { key, code };
}

export function verifyOtp(key: string, code: string, userId: number): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  if (entry.userId !== userId) return false;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return false;
  }
  entry.attempts++;
  if (entry.attempts > MAX_ATTEMPTS) {
    store.delete(key);
    return false;
  }
  if (entry.code !== code) return false;
  store.delete(key);
  return true;
}
