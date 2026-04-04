import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  numeric,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const foodTrucksTable = pgTable("food_trucks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  activityType: text("activity_type").notNull().default("food"),
  capacity: text("capacity").notNull().default("one"),
  dimensions: text("dimensions"),
  operatorsCount: integer("operators_count").default(1),
  withEquipment: boolean("with_equipment").notNull().default(false),
  licensed: boolean("licensed").notNull().default(false),
  location: text("location").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  listingType: text("listing_type").notNull().default("sale"),
  images: text("images").array().default([]),
  ownerName: text("owner_name").notNull(),
  ownerLogo: text("owner_logo"),
  available: boolean("available").notNull().default(true),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertFoodTruckSchema = createInsertSchema(foodTrucksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFoodTruck = z.infer<typeof insertFoodTruckSchema>;
export type FoodTruck = typeof foodTrucksTable.$inferSelect;
