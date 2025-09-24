import { Router } from "express";
import { createParty, getAllParties, getPartyById, updateParty, deleteParty } from "../controllers/party.controller.js";

const router = Router();

router.get("/", getAllParties);
router.get("/:id", getPartyById);
router.post("/", createParty);
router.put("/:id", updateParty);
router.delete("/:id", deleteParty);

export default router;