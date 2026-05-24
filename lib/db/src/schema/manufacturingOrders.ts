import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const manufacturingOrdersTable = pgTable("manufacturing_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  truckType: text("truck_type").notNull(), // food | beverages | custom
  capacity: text("capacity").notNull(),
  materials: text("materials").notNull(),
  hasSignage: boolean("has_signage").notNull().default(false),
  hasEquipment: boolean("has_equipment").notNull().default(false),
  equipmentDetails: text("equipment_details"),
  additionalDetails: text("additional_details"),
  logoUrl: text("logo_url"),
  filesUrls: text("files_urls").array().default([]),
  notes: text("notes"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  status: text("status").notNull().default("pending"),
  // pending | quoted | accepted | design | execution | delivery | completed
  acceptedQuoteId: integer("accepted_quote_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertManufacturingOrderSchema = createInsertSchema(
  manufacturingOrdersTable
).omit({ id: true, createdAt: true });

export type InsertManufacturingOrder = z.infer<
  typeof insertManufacturingOrderSchema
>;
export type ManufacturingOrder = typeof manufacturingOrdersTable.$inferSelect;
