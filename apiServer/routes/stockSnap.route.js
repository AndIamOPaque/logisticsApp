import { Router } from "express";
import { createStockSnap, getAllStockSnaps, getStockSnapById, updateStockSnap, deleteStockSnap } from "../controllers/stockSnap.controller.js";

const router = Router();

router.get("/", getAllStockSnaps);
router.get("/:id", getStockSnapById);
router.post("/", createStockSnap);
router.put("/:id", updateStockSnap);
router.delete("/:id", deleteStockSnap);

export default router;