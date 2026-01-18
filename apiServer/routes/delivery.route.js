import express from "express";
import {getDeliveries, createNewDelivery, getDeliveryById, changeDeliveryStatus} from "../controllers/delivery.controller.js";
import { mockAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/", getDeliveries);       
router.post("/", mockAuth, createNewDelivery);  
router.get("/:id", mockAuth, getDeliveryById);
router.patch("/:id/status", mockAuth, changeDeliveryStatus);

export default router;