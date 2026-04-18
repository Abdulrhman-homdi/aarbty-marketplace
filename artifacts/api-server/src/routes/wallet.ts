import { Router, type IRouter } from "express";
import { db, walletTransactionsTable } from "@workspace/db";
import {
  WalletDepositBody,
  WalletTransferBody,
  GetWalletBalanceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type DbTx = typeof walletTransactionsTable.$inferSelect;

function serializeTx(t: DbTx) {
  return {
    ...t,
    amount: Number(t.amount),
    contractId: t.contractId ?? undefined,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  };
}

router.get("/wallet/balance", async (_req, res): Promise<void> => {
  const transactions = await db
    .select()
    .from(walletTransactionsTable)
    .orderBy(walletTransactionsTable.createdAt);

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

  res.json(
    GetWalletBalanceResponse.parse({
      balance,
      escrowBalance,
      totalDeposited,
      totalTransferred,
      transactions: transactions.map(serializeTx),
    })
  );
});

router.post("/wallet/deposit", async (req, res): Promise<void> => {
  const parsed = WalletDepositBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [tx] = await db
    .insert(walletTransactionsTable)
    .values({
      type: "deposit",
      amount: String(parsed.data.amount),
      description: parsed.data.description,
      contractId: parsed.data.contractId,
    })
    .returning();

  res.status(201).json(serializeTx(tx));
});

router.post("/wallet/transfer", async (req, res): Promise<void> => {
  const parsed = WalletTransferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [tx] = await db
    .insert(walletTransactionsTable)
    .values({
      type: "transfer",
      amount: String(parsed.data.amount),
      description: parsed.data.description,
      contractId: parsed.data.contractId,
    })
    .returning();

  res.status(201).json(serializeTx(tx));
});

export default router;
