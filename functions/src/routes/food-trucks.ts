import { Router } from "express";
import { firestoreDb } from "../db.js";

const router = Router();

router.get("/food-trucks", async (req, res) => {
  try {
    const { activityType, capacity, withEquipment, location, licensed, listingType, minPrice, maxPrice } = req.query;

    let trucks: any[] = await firestoreDb.getAll("foodTrucks");

    if (activityType) trucks = trucks.filter((t) => t.activityType === activityType);
    if (capacity) trucks = trucks.filter((t) => t.capacity === capacity);
    if (withEquipment !== undefined) trucks = trucks.filter((t) => t.withEquipment === (withEquipment === "true"));
    if (location) trucks = trucks.filter((t) => t.location === location);
    if (licensed !== undefined) trucks = trucks.filter((t) => t.licensed === (licensed === "true"));
    if (listingType) trucks = trucks.filter((t) => t.listingType === listingType);
    if (minPrice) trucks = trucks.filter((t) => t.price >= Number(minPrice));
    if (maxPrice) trucks = trucks.filter((t) => t.price <= Number(maxPrice));

    res.json(trucks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/food-trucks", async (req, res) => {
  try {
    const truck = await firestoreDb.create("foodTrucks", {
      ...req.body,
      price: Number(req.body.price),
      images: req.body.images ?? [],
      available: true,
    });
    res.status(201).json(truck);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/food-trucks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const truck = await firestoreDb.getById("foodTrucks", id);
    if (!truck) { res.status(404).json({ error: "Food truck not found" }); return; }

    res.json(truck);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/food-trucks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const truck = await firestoreDb.update("foodTrucks", id, {
      ...req.body,
      price: req.body.price != null ? Number(req.body.price) : undefined,
    });
    if (!truck) { res.status(404).json({ error: "Food truck not found" }); return; }

    res.json(truck);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/food-trucks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const deleted = await firestoreDb.remove("foodTrucks", id);
    if (!deleted) { res.status(404).json({ error: "Food truck not found" }); return; }

    res.sendStatus(204);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/food-trucks/:id/availability", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const truck = await firestoreDb.update("foodTrucks", id, { available: req.body.available });
    if (!truck) { res.status(404).json({ error: "Food truck not found" }); return; }

    res.json(truck);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
