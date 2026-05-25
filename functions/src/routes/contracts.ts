import { Router } from "express";
import { firestoreDb } from "../db.js";

const router = Router();

router.get("/contracts", async (req, res) => {
  try {
    const { type } = req.query;
    let contracts: any[] = await firestoreDb.getAll("contracts");
    if (type) contracts = contracts.filter((c) => c.type === type);
    res.json(contracts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/contracts", async (req, res) => {
  try {
    const data = req.body;
    const depositAmount = data.depositAmount ?? data.price * 0.3;
    const remainingAmount = data.price - depositAmount;

    let monthlyPayment: number | undefined;
    if (data.type === "rent" && data.rentalPeriodCount && data.rentalPeriodCount > 1) {
      monthlyPayment = remainingAmount / (data.rentalPeriodCount - 1);
    }

    const contract = await firestoreDb.create("contracts", {
      ...data,
      price: Number(data.price),
      depositAmount: Number(depositAmount),
      remainingAmount: Number(remainingAmount),
      monthlyPayment: monthlyPayment != null ? Number(monthlyPayment) : undefined,
      status: "draft",
    });

    res.status(201).json(contract);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/contracts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const contract = await firestoreDb.getById("contracts", id);
    if (!contract) { res.status(404).json({ error: "Contract not found" }); return; }

    res.json(contract);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
