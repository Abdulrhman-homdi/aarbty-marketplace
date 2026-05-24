import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, manufacturingOrdersTable, manufacturerQuotesTable } from "@workspace/db";

const router: IRouter = Router();

type DbOrder = typeof manufacturingOrdersTable.$inferSelect;
type DbQuote = typeof manufacturerQuotesTable.$inferSelect;

function serializeOrder(o: DbOrder) {
  return {
    ...o,
    equipmentDetails: o.equipmentDetails ?? undefined,
    additionalDetails: o.additionalDetails ?? undefined,
    logoUrl: o.logoUrl ?? undefined,
    filesUrls: o.filesUrls ?? [],
    notes: o.notes ?? undefined,
    customerEmail: o.customerEmail ?? undefined,
    acceptedQuoteId: o.acceptedQuoteId ?? undefined,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
  };
}

function serializeQuote(q: DbQuote) {
  return {
    ...q,
    price: Number(q.price),
    createdAt: q.createdAt instanceof Date ? q.createdAt.toISOString() : String(q.createdAt),
  };
}

function generateOrderNumber(): string {
  const prefix = "MFG";
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${ts}-${rand}`;
}

// List all manufacturing orders
router.get("/manufacturing-orders", async (req, res): Promise<void> => {
  const orders = await db.select().from(manufacturingOrdersTable).orderBy(manufacturingOrdersTable.createdAt);
  res.json(orders.map(serializeOrder));
});

// Create manufacturing order
router.post("/manufacturing-orders", async (req, res): Promise<void> => {
  const {
    truckType, capacity, materials, hasSignage, hasEquipment,
    equipmentDetails, additionalDetails, logoUrl, filesUrls,
    notes, customerName, customerPhone, customerEmail,
  } = req.body;

  if (!truckType || !capacity || !materials || !customerName || !customerPhone) {
    res.status(400).json({ error: "حقول مطلوبة ناقصة" });
    return;
  }

  const [order] = await db.insert(manufacturingOrdersTable).values({
    orderNumber: generateOrderNumber(),
    truckType,
    capacity,
    materials,
    hasSignage: !!hasSignage,
    hasEquipment: !!hasEquipment,
    equipmentDetails: equipmentDetails || null,
    additionalDetails: additionalDetails || null,
    logoUrl: logoUrl || null,
    filesUrls: filesUrls || [],
    notes: notes || null,
    customerName,
    customerPhone,
    customerEmail: customerEmail || null,
    status: "pending",
  }).returning();

  res.status(201).json(serializeOrder(order));
});

// Get single order with quotes
router.get("/manufacturing-orders/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "معرّف غير صالح" }); return; }

  const [order] = await db.select().from(manufacturingOrdersTable).where(eq(manufacturingOrdersTable.id, id));
  if (!order) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

  const quotes = await db.select().from(manufacturerQuotesTable).where(eq(manufacturerQuotesTable.orderId, id));

  res.json({ ...serializeOrder(order), quotes: quotes.map(serializeQuote) });
});

// Update order status
router.put("/manufacturing-orders/:id/status", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const validStatuses = ["pending", "quoted", "accepted", "design", "execution", "delivery", "completed"];

  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: "حالة غير صالحة" });
    return;
  }

  const [updated] = await db
    .update(manufacturingOrdersTable)
    .set({ status })
    .where(eq(manufacturingOrdersTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  res.json(serializeOrder(updated));
});

// Submit a quote
router.post("/manufacturing-orders/:id/quotes", async (req, res): Promise<void> => {
  const orderId = parseInt(req.params.id, 10);
  const { manufacturerName, price, duration, details } = req.body;

  if (!manufacturerName || !price || !duration || !details) {
    res.status(400).json({ error: "حقول مطلوبة ناقصة" });
    return;
  }

  const [order] = await db.select().from(manufacturingOrdersTable).where(eq(manufacturingOrdersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

  const [quote] = await db.insert(manufacturerQuotesTable).values({
    orderId,
    manufacturerName,
    price: String(price),
    duration: parseInt(duration, 10),
    details,
    status: "pending",
  }).returning();

  // Mark order as "quoted" if still pending
  if (order.status === "pending") {
    await db.update(manufacturingOrdersTable).set({ status: "quoted" }).where(eq(manufacturingOrdersTable.id, orderId));
  }

  res.status(201).json(serializeQuote(quote));
});

// Accept a quote
router.put("/manufacturing-orders/:id/quotes/:quoteId/accept", async (req, res): Promise<void> => {
  const orderId = parseInt(req.params.id, 10);
  const quoteId = parseInt(req.params.quoteId, 10);

  const [quote] = await db.select().from(manufacturerQuotesTable).where(eq(manufacturerQuotesTable.id, quoteId));
  if (!quote || quote.orderId !== orderId) { res.status(404).json({ error: "العرض غير موجود" }); return; }

  // Accept this quote, reject others
  await db.update(manufacturerQuotesTable).set({ status: "accepted" }).where(eq(manufacturerQuotesTable.id, quoteId));
  const allQuotes = await db.select().from(manufacturerQuotesTable).where(eq(manufacturerQuotesTable.orderId, orderId));
  for (const q of allQuotes) {
    if (q.id !== quoteId) {
      await db.update(manufacturerQuotesTable).set({ status: "rejected" }).where(eq(manufacturerQuotesTable.id, q.id));
    }
  }

  const [updatedOrder] = await db
    .update(manufacturingOrdersTable)
    .set({ status: "design", acceptedQuoteId: quoteId })
    .where(eq(manufacturingOrdersTable.id, orderId))
    .returning();

  const quotes = await db.select().from(manufacturerQuotesTable).where(eq(manufacturerQuotesTable.orderId, orderId));
  res.json({ ...serializeOrder(updatedOrder), quotes: quotes.map(serializeQuote) });
});

export default router;
