import { Router } from "express";
import { firestoreDb } from "../db.js";

const router = Router();

router.get("/inquiries", async (req, res) => {
  try {
    const { truckId, status } = req.query;
    let inquiries: any[] = await firestoreDb.getAll("inquiries");

    if (truckId) inquiries = inquiries.filter((i) => i.truckId === Number(truckId));
    if (status) inquiries = inquiries.filter((i) => i.status === status);

    res.json(inquiries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/inquiries", async (req, res) => {
  try {
    const { truckId, customerName, customerEmail, customerPhone, message } = req.body;

    let truckName: string | undefined;
    const truck = await firestoreDb.getById("foodTrucks", truckId);
    if (truck) truckName = (truck as any).name;

    const inquiry = await firestoreDb.create("inquiries", {
      truckId,
      truckName,
      customerName,
      customerEmail,
      customerPhone,
      message,
      status: "pending",
      type: (truck as any)?.listingType,
    });

    res.status(201).json(inquiry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/inquiries/:id/respond", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const inquiry = await firestoreDb.update("inquiries", id, {
      status: req.body.status,
      respondedAt: new Date().toISOString(),
    });

    if (!inquiry) { res.status(404).json({ error: "Inquiry not found" }); return; }

    res.json(inquiry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
