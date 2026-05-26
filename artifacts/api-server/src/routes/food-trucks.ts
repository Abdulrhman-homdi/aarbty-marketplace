import { Router, type IRouter } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, foodTrucksTable } from "@workspace/db";
import {
  CreateFoodTruckBody,
  UpdateFoodTruckBody,
  GetFoodTruckParams,
  UpdateFoodTruckParams,
  DeleteFoodTruckParams,
  UpdateFoodTruckAvailabilityParams,
  UpdateFoodTruckAvailabilityBody,
  ListFoodTrucksQueryParams,
  GetFoodTruckResponse,
  ListFoodTrucksResponse,
  UpdateFoodTruckResponse,
  UpdateFoodTruckAvailabilityResponse,
} from "@workspace/api-zod";
import { requireRole } from "../middlewares/auth";

const router: IRouter = Router();

type DbTruck = typeof foodTrucksTable.$inferSelect;

function serializeTruck(t: DbTruck) {
  return {
    ...t,
    price: Number(t.price),
    images: t.images ?? [],
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  };
}

router.get("/food-trucks", async (req, res): Promise<void> => {
  const query = ListFoodTrucksQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const filters: ReturnType<typeof and>[] = [];
  const q = query.data;

  if (q.activityType) {
    filters.push(eq(foodTrucksTable.activityType, q.activityType));
  }
  if (q.capacity) {
    filters.push(eq(foodTrucksTable.capacity, q.capacity));
  }
  if (q.withEquipment !== undefined) {
    filters.push(eq(foodTrucksTable.withEquipment, q.withEquipment));
  }
  if (q.location) {
    filters.push(eq(foodTrucksTable.location, q.location));
  }
  if (q.licensed !== undefined) {
    filters.push(eq(foodTrucksTable.licensed, q.licensed));
  }
  if (q.listingType) {
    filters.push(eq(foodTrucksTable.listingType, q.listingType));
  }
  if (q.minPrice !== undefined) {
    filters.push(gte(foodTrucksTable.price, String(q.minPrice)));
  }
  if (q.maxPrice !== undefined) {
    filters.push(lte(foodTrucksTable.price, String(q.maxPrice)));
  }

  const trucks = await db
    .select()
    .from(foodTrucksTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(foodTrucksTable.createdAt);

  res.json(ListFoodTrucksResponse.parse(trucks.map(serializeTruck)));
});

router.post("/food-trucks", requireRole("provider", "admin"), async (req, res): Promise<void> => {
  const parsed = CreateFoodTruckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [truck] = await db
    .insert(foodTrucksTable)
    .values({
      ...parsed.data,
      price: String(parsed.data.price),
    })
    .returning();

  res.status(201).json(GetFoodTruckResponse.parse(serializeTruck(truck)));
});

router.get("/food-trucks/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFoodTruckParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [truck] = await db
    .select()
    .from(foodTrucksTable)
    .where(eq(foodTrucksTable.id, params.data.id));

  if (!truck) {
    res.status(404).json({ error: "Food truck not found" });
    return;
  }

  res.json(GetFoodTruckResponse.parse(serializeTruck(truck)));
});

router.put("/food-trucks/:id", requireRole("provider", "admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateFoodTruckParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFoodTruckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price !== undefined) {
    updateData.price = String(parsed.data.price);
  }

  const [truck] = await db
    .update(foodTrucksTable)
    .set(updateData)
    .where(eq(foodTrucksTable.id, params.data.id))
    .returning();

  if (!truck) {
    res.status(404).json({ error: "Food truck not found" });
    return;
  }

  res.json(UpdateFoodTruckResponse.parse(serializeTruck(truck)));
});

router.delete("/food-trucks/:id", requireRole("provider", "admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteFoodTruckParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [truck] = await db
    .delete(foodTrucksTable)
    .where(eq(foodTrucksTable.id, params.data.id))
    .returning();

  if (!truck) {
    res.status(404).json({ error: "Food truck not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/food-trucks/:id/availability", requireRole("provider", "admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateFoodTruckAvailabilityParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFoodTruckAvailabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [truck] = await db
    .update(foodTrucksTable)
    .set({ available: parsed.data.available })
    .where(eq(foodTrucksTable.id, params.data.id))
    .returning();

  if (!truck) {
    res.status(404).json({ error: "Food truck not found" });
    return;
  }

  res.json(UpdateFoodTruckAvailabilityResponse.parse(serializeTruck(truck)));
});

export default router;
