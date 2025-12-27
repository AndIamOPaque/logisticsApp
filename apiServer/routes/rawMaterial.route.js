import { Router } from "express";
import { createRawMaterial, getRawMaterials, getRawMaterialById, updateRawMaterial } from "../controllers/rawMaterial.controller.js";

const router = Router();

router.get("/", getRawMaterials);
router.get("/:id", getRawMaterialById);
router.post("/", createRawMaterial);
router.put("/:id", updateRawMaterial);

export default router;