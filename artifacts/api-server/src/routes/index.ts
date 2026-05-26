import { Router, type IRouter } from "express";
import healthRouter from "./health";
import foodTrucksRouter from "./food-trucks";
import inquiriesRouter from "./inquiries";
import contractsRouter from "./contracts";
import walletRouter from "./wallet";
import statsRouter from "./stats";
import uploadRouter from "./upload";
import manufacturingRouter from "./manufacturing";
import authRouter from "./auth";
import twoFactorRouter from "./two-factor";

const router: IRouter = Router();

router.use(authRouter);
router.use(twoFactorRouter);
router.use(healthRouter);
router.use(foodTrucksRouter);
router.use(inquiriesRouter);
router.use(contractsRouter);
router.use(walletRouter);
router.use(statsRouter);
router.use(uploadRouter);
router.use(manufacturingRouter);

export default router;
