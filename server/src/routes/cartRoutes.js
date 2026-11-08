import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

import {
  addToCart,
  updateCart,
  removeFromCart,
  clearUserCart,
  getCartByUser,
} from "../controllers/cartController.js";

const router = express.Router();


router.get("/", requireAuth, getCartByUser);
router.post("/", requireAuth, addToCart);
router.put("/:productId", requireAuth, updateCart);
router.delete("/:productId", requireAuth, removeFromCart);
router.delete("/", requireAuth, clearUserCart);

export default router;
