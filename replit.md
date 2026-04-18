# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a Food Truck Marketplace platform (سوق عربات الفود ترك) — Saudi Arabia's first specialized digital marketplace for buying and renting food trucks.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Routing**: Wouter
- **State**: TanStack Query

## Platform Features

- Arabic RTL interface (fully in Arabic, targeting Saudi Arabia)
- Yellow & Black branding
- Food truck listings with advanced filter (activity type, capacity, location, license, sale/rent)
- Truck image upload (multer, stored in `artifacts/api-server/uploads/`, served at `/api/uploads/<file>`)
- Edit existing truck listings (pre-filled form at `/edit-truck/:id`, provider-only)
- Shared TruckForm component (`src/components/truck-form.tsx`) used by both create and edit pages
- Availability inquiry system
- Digital wallet with escrow payment system
- Sale & rental contract management (digitally documented)
- Owner dashboard for managing trucks and inquiries

## Key Pages

- `/` — Home page with hero, search, stats, featured trucks
- `/trucks` — Browse all trucks with filter sidebar
- `/trucks/:id` — Truck detail + inquiry form link
- `/list-truck` — List a new food truck
- `/dashboard` — Owner dashboard (trucks, inquiries, respond to inquiries)
- `/wallet` — Wallet management + transaction history
- `/contracts` — Contract listing
- `/contracts/:id` — Contract detail view
- `/inquiry/:id` — Submit inquiry for specific truck

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/food-truck-marketplace run dev` — run frontend locally

## DB Tables

- `food_trucks` — truck listings
- `inquiries` — customer inquiries
- `contracts` — sale/rent contracts
- `wallet_transactions` — payment records

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
