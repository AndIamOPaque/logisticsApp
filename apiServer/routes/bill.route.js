import express from "express";
import * as BillController from "../controllers/bill.controller.js";
import { mockAuth } from "../middlewares/auth.middleware.js"; 
import { get } from "mongoose";

const router = express.Router();

// All bill routes require login
// router.use(protect);

router.get("/", BillController.getBills);
router.get("/:id", BillController.getBillById);
router.post("/", mockAuth, BillController.createBill);     
router.patch("/:id", mockAuth, BillController.updateBill); 
router.patch("/:id/pay", mockAuth, BillController.markPaid); 
router.post("/:id/items", mockAuth, BillController.addItems); 
router.delete("/:id/items", mockAuth, BillController.removeItems);
router.post("/:id/attachments", mockAuth, BillController.addAttachment);
router.delete("/:id/attachments/:attachmentId", mockAuth, BillController.removeAttachment);

export default router;