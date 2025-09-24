import { Router } from "express";
import { createProductionLog, getAllProductionLogs, getProductionLogById, updateProductionLog, deleteProductionLog } from "../controllers/productionLog.controller.js";

const router = Router();

router.get("/", getAllProductionLogs);
router.get("/:id", getProductionLogById);
router.post("/", createProductionLog);
router.put("/:id", updateProductionLog);
router.delete("/:id", deleteProductionLog);

export default router;