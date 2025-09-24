import { Router } from "express";
import { createRawMaterial, getAllRawMaterials, getRawMaterialById, updateRawMaterial, deleteRawMaterial } from "../controllers/rawMaterial.controller.js";

const router = Router();

router.get("/", getAllRawMaterials);
router.get("/:id", getRawMaterialById);
router.post("/", createRawMaterial);
router.put("/:id", updateRawMaterial);
router.delete("/:id", deleteRawMaterial);

export default router;