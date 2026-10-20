
import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

import {
  getProductImages,
  getProductImage,
  createProductImageController,
  updateProductImageController,
  deleteProductImageController,
} from "../controllers/productImageController.js";

const router = express.Router();

router.get("/product/:productId", getProductImages);
router.get("/:id", getProductImage);

router.post(
  "/product/:productId",
  requireAdmin,
  upload.single("image"),
  createProductImageController,
);

router.put(
  "/:id",
  requireAdmin,
  upload.single("image"),
  updateProductImageController,
);

router.delete("/:id", requireAdmin, deleteProductImageController);

export default router;
