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

export const manufacturerQuotesTable = pgTable("manufacturer_quotes", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  manufacturerName: text("manufacturer_name").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // days
  details: text("details").notNull(),
  status: text("status").notNull().default("pending"), // pending | accepted | rejected
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertManufacturerQuoteSchema = createInsertSchema(
  manufacturerQuotesTable
).omit({ id: true, createdAt: true });

export type InsertManufacturerQuote = z.infer<
  typeof insertManufacturerQuoteSchema
>;
export type ManufacturerQuote = typeof manufacturerQuotesTable.$inferSelect;
