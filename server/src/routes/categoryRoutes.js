import express from "express";
import { requireAdmin } from "../middleware/authMiddleware.js";

import {
  getCategories,
  getCategory,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  createCategoryController,
);

router.put(
  "/:id",
  requireAdmin,
  upload.single("image"),
  updateCategoryController,
);

router.delete("/:id", requireAdmin, deleteCategoryController);

export default router;
