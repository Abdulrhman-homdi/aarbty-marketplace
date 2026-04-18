import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, inquiriesTable, foodTrucksTable } from "@workspace/db";
import {
  CreateInquiryBody,
  RespondToInquiryParams,
  RespondToInquiryBody,
  ListInquiriesQueryParams,
  ListInquiriesResponse,
  RespondToInquiryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type DbInquiry = typeof inquiriesTable.$inferSelect;

function serializeInquiry(i: DbInquiry) {
  return {
    ...i,
    truckName: i.truckName ?? undefined,
    message: i.message ?? undefined,
    respondedAt: i.respondedAt instanceof Date ? i.respondedAt.toISOString() : (i.respondedAt ?? undefined),
    createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
  };
}

router.get("/inquiries", async (req, res): Promise<void> => {
  const query = ListInquiriesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const filters: ReturnType<typeof and>[] = [];
  if (query.data.truckId) {
    filters.push(eq(inquiriesTable.truckId, query.data.truckId));
  }
  if (query.data.status) {
    filters.push(eq(inquiriesTable.status, query.data.status));
  }

  const inquiries = await db
    .select()
    .from(inquiriesTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(inquiriesTable.createdAt);

  res.json(ListInquiriesResponse.parse(inquiries.map(serializeInquiry)));
});

router.post("/inquiries", async (req, res): Promise<void> => {
  const parsed = CreateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let truckName: string | undefined;
  const [truck] = await db
    .select()
    .from(foodTrucksTable)
    .where(eq(foodTrucksTable.id, parsed.data.truckId));
  if (truck) {
    truckName = truck.name;
  }

  const [inquiry] = await db
    .insert(inquiriesTable)
    .values({ ...parsed.data, truckName })
    .returning();

  res.status(201).json(serializeInquiry(inquiry));
});

router.patch("/inquiries/:id/respond", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RespondToInquiryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = RespondToInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [inquiry] = await db
    .update(inquiriesTable)
    .set({ status: parsed.data.status, respondedAt: new Date() })
    .where(eq(inquiriesTable.id, params.data.id))
    .returning();

  if (!inquiry) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }

  res.json(RespondToInquiryResponse.parse(serializeInquiry(inquiry)));
});

export default router;
