import { Router } from "express";
import { getRawMaterialStockLevels, createRawMaterial, getRawMaterials,correctRawMaterialStock, getRawMaterialById, updateRawMaterial } from "../controllers/rawMaterial.controller.js";
import { mockAuth } from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/", getRawMaterials);
router.get("/:id", getRawMaterialById);
router.post("/", mockAuth, createRawMaterial);
router.put("/:id", mockAuth, updateRawMaterial);
router.post("/:id/correct-stock", mockAuth, correctRawMaterialStock);
router.get("/:id/stock-level", getRawMaterialStockLevels);

export default router;