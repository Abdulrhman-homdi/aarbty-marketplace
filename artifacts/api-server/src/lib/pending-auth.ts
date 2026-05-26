import crypto from "crypto";

const store = new Map<string, number>();

const TTL_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, _] of store) {
    // entries don't track time, so we clear stale ones on access
  }
}, 60_000);

export function createPendingAuthToken(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  store.set(token, userId);
  setTimeout(() => store.delete(token), TTL_MS);
  return token;
}

export function consumePendingAuthToken(token: string): number | null {
  const userId = store.get(token) ?? null;
  if (userId !== null) {
    store.delete(token);
  }
  return userId;
}

export function peekPendingAuthToken(token: string): number | null {
  return store.get(token) ?? null;
}
