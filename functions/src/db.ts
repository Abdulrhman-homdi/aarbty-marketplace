import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";

const db: Firestore = getFirestore();

async function getNextId(collection: string): Promise<number> {
  const ref = db.collection("counters").doc(collection);
  const result = await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const next = (doc.data()?.value ?? 0) + 1;
    t.set(ref, { value: next }, { merge: true });
    return next;
  });
  return result;
}

function toPlain(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

function toTimestamp(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      result[key] = Timestamp.fromDate(new Date(value));
    } else {
      result[key] = value;
    }
  }
  return result;
}

export const firestoreDb = {
  async getAll<T>(collection: string): Promise<T[]> {
    const snapshot = await db.collection(collection).orderBy("createdAt", "asc").get();
    return snapshot.docs.map((d) => ({ id: Number(d.id), ...toPlain(d.data() as Record<string, unknown>) }) as T);
  },

  async getById<T>(collection: string, id: number): Promise<T | null> {
    const doc = await db.collection(collection).doc(String(id)).get();
    if (!doc.exists) return null;
    return { id: Number(doc.id), ...toPlain(doc.data() as Record<string, unknown>) } as T;
  },

  async create<T>(collection: string, data: Record<string, unknown>): Promise<T> {
    const id = await getNextId(collection);
    const docData = { ...toTimestamp(data), createdAt: Timestamp.fromDate(new Date()), id };
    await db.collection(collection).doc(String(id)).set(docData);
    return { id, ...toPlain(docData) } as T;
  },

  async update<T>(collection: string, id: number, data: Record<string, unknown>): Promise<T | null> {
    const ref = db.collection(collection).doc(String(id));
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update(toTimestamp(data));
    const updated = await ref.get();
    return { id, ...toPlain(updated.data() as Record<string, unknown>) } as T;
  },

  async remove(collection: string, id: number): Promise<boolean> {
    const ref = db.collection(collection).doc(String(id));
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },

  async query<T>(collection: string, filters: Record<string, unknown>): Promise<T[]> {
    let query: FirebaseFirestore.Query = db.collection(collection);
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.where(key, "==", value);
      }
    }
    const snapshot = await query.orderBy("createdAt", "asc").get();
    return snapshot.docs.map((d) => ({ id: Number(d.id), ...toPlain(d.data() as Record<string, unknown>) }) as T);
  },

  async queryWhereIn<T>(collection: string, field: string, values: unknown[]): Promise<T[]> {
    if (values.length === 0) return [];
    const snapshot = await db.collection(collection).where(field, "in", values).get();
    return snapshot.docs.map((d) => ({ id: Number(d.id), ...toPlain(d.data() as Record<string, unknown>) }) as T);
  },
};
