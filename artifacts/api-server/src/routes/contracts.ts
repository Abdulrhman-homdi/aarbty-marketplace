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
    monthlyPayment: c.monthlyPayment != null ? Number(c.monthlyPayment) : undefined,
    rentalPeriodCount: c.rentalPeriodCount ?? undefined,
    truckName: c.truckName ?? undefined,
    ownerEmail: c.ownerEmail ?? undefined,
    buyerEmail: c.buyerEmail ?? undefined,
    rentalDuration: (c.rentalDuration as "monthly" | "yearly" | undefined) ?? undefined,
    startDate: c.startDate instanceof Date ? c.startDate.toISOString() : (c.startDate ?? undefined),
    endDate: c.endDate instanceof Date ? c.endDate.toISOString() : (c.endDate ?? undefined),
    terms: c.terms ?? undefined,
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

  const { rentalPeriodCount, startDate, endDate, ...rest } = parsed.data;

  const depositAmount = parsed.data.depositAmount ?? parsed.data.price * 0.3;
  const remainingAmount = parsed.data.price - depositAmount;

  let monthlyPayment: number | undefined;
  if (parsed.data.type === "rent" && rentalPeriodCount && rentalPeriodCount > 1) {
    monthlyPayment = remainingAmount / (rentalPeriodCount - 1);
  }

  const [contract] = await db
    .insert(contractsTable)
    .values({
      ...rest,
      price: String(rest.price),
      depositAmount: String(depositAmount),
      remainingAmount: String(remainingAmount),
      monthlyPayment: monthlyPayment != null ? String(monthlyPayment) : undefined,
      rentalPeriodCount: rentalPeriodCount ?? undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
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
