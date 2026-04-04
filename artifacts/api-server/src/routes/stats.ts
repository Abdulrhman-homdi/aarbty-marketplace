import { Router, type IRouter } from "express";
import {
  db,
  foodTrucksTable,
  inquiriesTable,
  contractsTable,
  walletTransactionsTable,
} from "@workspace/db";
import { GetPlatformStatsResponse, GetRecentActivityResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const trucks = await db.select().from(foodTrucksTable);
  const inquiries = await db.select().from(inquiriesTable);
  const contracts = await db.select().from(contractsTable);
  const txs = await db.select().from(walletTransactionsTable);

  const totalTransactionVolume = txs
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const stats = {
    totalTrucks: trucks.length,
    trucksForSale: trucks.filter((t) => t.listingType === "sale").length,
    trucksForRent: trucks.filter((t) => t.listingType === "rent").length,
    availableTrucks: trucks.filter((t) => t.available).length,
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter((i) => i.status === "pending").length,
    confirmedInquiries: inquiries.filter((i) => i.status === "confirmed").length,
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c) => c.status === "active").length,
    totalTransactionVolume,
  };

  res.json(GetPlatformStatsResponse.parse(stats));
});

router.get("/stats/recent-activity", async (_req, res): Promise<void> => {
  const trucks = await db
    .select()
    .from(foodTrucksTable)
    .orderBy(foodTrucksTable.createdAt)
    .limit(3);
  const inquiries = await db
    .select()
    .from(inquiriesTable)
    .orderBy(inquiriesTable.createdAt)
    .limit(3);
  const contracts = await db
    .select()
    .from(contractsTable)
    .orderBy(contractsTable.createdAt)
    .limit(3);

  const activities = [
    ...trucks.map((t) => ({
      id: t.id,
      type: "truck_listed" as const,
      description: `تم إضافة عربة: ${t.name}`,
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
    })),
    ...inquiries.map((i) => ({
      id: i.id + 1000,
      type: "inquiry_submitted" as const,
      description: `استفسار جديد من: ${i.customerName}`,
      createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
    })),
    ...contracts.map((c) => ({
      id: c.id + 2000,
      type: "contract_created" as const,
      description: `عقد ${c.type === "sale" ? "بيع" : "إيجار"}: ${c.truckName ?? "عربة"}`,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  res.json(GetRecentActivityResponse.parse(activities));
});

export default router;
