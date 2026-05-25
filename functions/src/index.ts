import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./auth.js";
import foodTrucksRouter from "./routes/food-trucks.js";
import inquiriesRouter from "./routes/inquiries.js";
import contractsRouter from "./routes/contracts.js";
import walletRouter from "./routes/wallet.js";
import statsRouter from "./routes/stats.js";
import manufacturingRouter from "./routes/manufacturing.js";
import authRouter from "./routes/auth.js";
import healthRouter from "./routes/health.js";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(authMiddleware);

app.use(authRouter);
app.use(healthRouter);
app.use(foodTrucksRouter);
app.use(inquiriesRouter);
app.use(contractsRouter);
app.use(walletRouter);
app.use(statsRouter);
app.use(manufacturingRouter);

export const api = onRequest({ maxInstances: 10 }, app);
