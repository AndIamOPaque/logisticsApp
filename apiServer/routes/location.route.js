import { Router } from "express";
import { createLocation, getAllLocations, getLocationById, updateLocation, deleteLocation } from "../controllers/location.controller.js";

const router = Router();

router.get("/", getAllLocations);
router.get("/:id", getLocationById);
router.post("/", createLocation);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);

export default router;