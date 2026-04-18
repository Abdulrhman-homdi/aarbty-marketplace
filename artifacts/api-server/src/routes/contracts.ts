import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, contractsTable } from "@workspace/db";
import {
  CreateContractBody,
  GetContractParams,
  ListContractsQueryParams,
  ListContractsResponse,
  GetContractResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type DbContract = typeof contractsTable.$inferSelect;

function serializeContract(c: DbContract) {
  return {
    ...c,
    price: Number(c.price),
    depositAmount: c.depositAmount != null ? Number(c.depositAmount) : undefined,
    remainingAmount: c.remainingAmount != null ? Number(c.remainingAmount) : undefined,
    truckName: c.truckName ?? undefined,
    buyerName: c.buyerName ?? undefined,
    sellerName: c.sellerName ?? undefined,
    startDate: c.startDate ?? undefined,
    endDate: c.endDate ?? undefined,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
  };
}

router.get("/contracts", async (req, res): Promise<void> => {
  const query = ListContractsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const contracts = query.data.type
    ? await db.select().from(contractsTable).where(eq(contractsTable.type, query.data.type))
    : await db.select().from(contractsTable).orderBy(contractsTable.createdAt);

  res.json(ListContractsResponse.parse(contracts.map(serializeContract)));
});

router.post("/contracts", async (req, res): Promise<void> => {
  const parsed = CreateContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const depositAmount = parsed.data.depositAmount ?? parsed.data.price * 0.3;
  const remainingAmount = parsed.data.price - depositAmount;

  const [contract] = await db
    .insert(contractsTable)
    .values({
      ...parsed.data,
      price: String(parsed.data.price),
      depositAmount: String(depositAmount),
      remainingAmount: String(remainingAmount),
    })
    .returning();

  res.status(201).json(GetContractResponse.parse(serializeContract(contract)));
});

router.get("/contracts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetContractParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, params.data.id));

  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  res.json(GetContractResponse.parse(serializeContract(contract)));
});

export default router;
