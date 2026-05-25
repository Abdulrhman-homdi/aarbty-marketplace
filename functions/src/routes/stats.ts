import { Router } from "express";
import { firestoreDb } from "../db.js";

const router = Router();

router.get("/stats/summary", async (_req, res) => {
  try {
    const trucks: any[] = await firestoreDb.getAll("foodTrucks");
    const inquiries: any[] = await firestoreDb.getAll("inquiries");
    const contracts: any[] = await firestoreDb.getAll("contracts");
    const txs: any[] = await firestoreDb.getAll("walletTransactions");

    const totalTransactionVolume = txs
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    res.json({
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
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/recent-activity", async (_req, res) => {
  try {
    const trucks: any[] = await firestoreDb.getAll("foodTrucks");
    const inquiries: any[] = await firestoreDb.getAll("inquiries");
    const contracts: any[] = await firestoreDb.getAll("contracts");

    const activities = [
      ...trucks.slice(0, 3).map((t) => ({
        id: t.id,
        type: "truck_listed" as const,
        description: `تم إضافة عربة: ${t.name}`,
        createdAt: t.createdAt,
      })),
      ...inquiries.slice(0, 3).map((i) => ({
        id: i.id + 1000,
        type: "inquiry_submitted" as const,
        description: `استفسار جديد من: ${i.customerName}`,
        createdAt: i.createdAt,
      })),
      ...contracts.slice(0, 3).map((c) => ({
        id: c.id + 2000,
        type: "contract_created" as const,
        description: `عقد ${c.type === "sale" ? "بيع" : "إيجار"}: ${c.truckName ?? "عربة"}`,
        createdAt: c.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
