import { Router } from "express";
import { firestoreDb } from "../db.js";

const router = Router();

router.get("/wallet/balance", async (_req, res) => {
  try {
    const transactions: any[] = await firestoreDb.getAll("walletTransactions");

    let balance = 0;
    let escrowBalance = 0;
    let totalDeposited = 0;
    let totalTransferred = 0;

    for (const t of transactions) {
      const amount = Number(t.amount);
      if (t.type === "deposit") {
        balance += amount;
        totalDeposited += amount;
      } else if (t.type === "escrow") {
        balance -= amount;
        escrowBalance += amount;
      } else if (t.type === "transfer") {
        escrowBalance -= amount;
        totalTransferred += amount;
      }
    }

    res.json({
      balance,
      escrowBalance,
      totalDeposited,
      totalTransferred,
      transactions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/wallet/deposit", async (req, res) => {
  try {
    const tx = await firestoreDb.create("walletTransactions", {
      type: "deposit",
      amount: Number(req.body.amount),
      description: req.body.description,
      contractId: req.body.contractId,
    });
    res.status(201).json(tx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/wallet/transfer", async (req, res) => {
  try {
    const tx = await firestoreDb.create("walletTransactions", {
      type: "transfer",
      amount: Number(req.body.amount),
      description: req.body.description,
      contractId: req.body.contractId,
    });
    res.status(201).json(tx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
