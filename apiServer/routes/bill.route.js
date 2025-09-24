import { Router } from "express";
import { createBill, getAllBills, getBillById, updateBill, deleteBill } from "../controllers/bill.controller.js";

const router = Router();

router.get("/", getAllBills);
router.get("/:id", getBillById);
router.post("/", createBill);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

export default router;