import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("sale"),
  truckId: integer("truck_id").notNull(),
  truckName: text("truck_name"),
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email"),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  depositAmount: numeric("deposit_amount", { precision: 12, scale: 2 }),
  remainingAmount: numeric("remaining_amount", { precision: 12, scale: 2 }),
  rentalDuration: text("rental_duration"),
  terms: text("terms"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
