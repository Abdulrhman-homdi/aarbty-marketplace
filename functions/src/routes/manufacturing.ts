import { Router } from "express";
import { firestoreDb } from "../db.js";

const router = Router();

function generateOrderNumber(): string {
  const prefix = "MFG";
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${ts}-${rand}`;
}

router.get("/manufacturing-orders", async (_req, res) => {
  try {
    const orders = await firestoreDb.getAll("manufacturingOrders");
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/manufacturing-orders", async (req, res) => {
  try {
    const {
      truckType, capacity, materials, hasSignage, hasEquipment,
      equipmentDetails, additionalDetails, logoUrl, filesUrls,
      notes, customerName, customerPhone, customerEmail,
    } = req.body;

    if (!truckType || !capacity || !materials || !customerName || !customerPhone) {
      res.status(400).json({ error: "حقول مطلوبة ناقصة" });
      return;
    }

    const order = await firestoreDb.create("manufacturingOrders", {
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
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/manufacturing-orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "معرّف غير صالح" }); return; }

    const order = await firestoreDb.getById("manufacturingOrders", id);
    if (!order) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    const quotes = await firestoreDb.query("manufacturerQuotes", { orderId: id });

    res.json({ ...order, quotes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/manufacturing-orders/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const validStatuses = ["pending", "quoted", "accepted", "design", "execution", "delivery", "completed"];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: "حالة غير صالحة" });
      return;
    }

    const updated = await firestoreDb.update("manufacturingOrders", id, { status });
    if (!updated) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/manufacturing-orders/:id/quotes", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { manufacturerName, price, duration, details } = req.body;

    if (!manufacturerName || !price || !duration || !details) {
      res.status(400).json({ error: "حقول مطلوبة ناقصة" });
      return;
    }

    const order = await firestoreDb.getById("manufacturingOrders", orderId);
    if (!order) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    const quote = await firestoreDb.create("manufacturerQuotes", {
      orderId,
      manufacturerName,
      price: Number(price),
      duration: Number(duration),
      details,
      status: "pending",
    });

    if ((order as any).status === "pending") {
      await firestoreDb.update("manufacturingOrders", orderId, { status: "quoted" });
    }

    res.status(201).json(quote);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/manufacturing-orders/:id/quotes/:quoteId/accept", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const quoteId = parseInt(req.params.quoteId, 10);

    const quote = await firestoreDb.getById("manufacturerQuotes", quoteId);
    if (!quote || (quote as any).orderId !== orderId) {
      res.status(404).json({ error: "العرض غير موجود" });
      return;
    }

    const allQuotes: any[] = await firestoreDb.query("manufacturerQuotes", { orderId });

    for (const q of allQuotes) {
      if (q.id === quoteId) {
        await firestoreDb.update("manufacturerQuotes", q.id, { status: "accepted" });
      } else {
        await firestoreDb.update("manufacturerQuotes", q.id, { status: "rejected" });
      }
    }

    const updatedOrder = await firestoreDb.update("manufacturingOrders", orderId, {
      status: "design",
      acceptedQuoteId: quoteId,
    });

    const quotes = await firestoreDb.query("manufacturerQuotes", { orderId });
    res.json({ ...(updatedOrder ?? {}), quotes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
