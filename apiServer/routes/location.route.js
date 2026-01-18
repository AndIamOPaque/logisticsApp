import express from "express";
import * as LocationController from "../controllers/location.controller.js";
import { mockAuth } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

// router.use(protect);
router.get("/", LocationController.getAllLocations);
router.get("/:id", LocationController.getLocationById);
router.post("/", mockAuth, LocationController.createLocation);
router.patch("/:id", mockAuth, LocationController.updateLocation);
router.delete("/:id", mockAuth, LocationController.deleteLocation);
//admin only bnade
export default router;