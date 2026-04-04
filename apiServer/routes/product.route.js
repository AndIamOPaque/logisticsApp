import { Router } from "express";
import { correctProductStock, createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductStockLevels } from "../controllers/product.controller.js";
import { mockAuth } from "../middlewares/auth.middleware.js";
 
const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", mockAuth, createProduct);//left to use in ui
router.patch("/:id", mockAuth, updateProduct);
router.delete("/:id", mockAuth, deleteProduct);
router.post("/:id/correct-stock", mockAuth, correctProductStock);
router.get("/:id/stock-level", getProductStockLevels)

export default router;