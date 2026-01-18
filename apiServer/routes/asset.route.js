import express from "express";
import * as AssetController from "../controllers/asset.controller.js";
import { mockAuth } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

// All asset routes require authentication
// router.use(protect);

router.get("/", AssetController.getAssets);
router.post("/", mockAuth, AssetController.createAsset);
router.get("/:id", AssetController.getAssetById);
router.patch("/:id", AssetController.updateAsset);
router.post("/:id/service", mockAuth, AssetController.addServiceRecord);

export default router;