import express from "express";
import * as DashboardController from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/low-stock", DashboardController.lowStockAlerts);

export default router;
