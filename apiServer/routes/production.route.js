import { Router } from "express";
import { changeProductionOrderStatus, createNewProductionOrder, getProductionOrder, getProductionOrderById, recordMaterialUsage, recordProductionOutput, returnUnusedMaterials } from "../controllers/production.controller.js";
import { mockAuth } from "../middlewares/auth.middleware.js";


const router = Router();

router.get("/", getProductionOrder);
router.get("/:id", getProductionOrderById)
router.post("/",mockAuth, createNewProductionOrder);
router.patch("/:id/material-usage", mockAuth, recordMaterialUsage);
router.patch("/:id/product-output", mockAuth, recordProductionOutput);
router.patch("/:id/return-material", mockAuth, returnUnusedMaterials);
router.patch("/:id/status", mockAuth, changeProductionOrderStatus);

export default router;