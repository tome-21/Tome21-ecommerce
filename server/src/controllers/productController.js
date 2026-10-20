import {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getProducts,
} from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";
import { getImagesByProductId } from "../models/productImageModel.js";

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await getTopProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting products", error);
    res.status(500).json({
      error: "Faild to get products",
    });
  }
};

export const getProductsController = async (req, res) => {
  try {
    const { categoryId, minPrice, maxPrice, condition, sortBy, q, search } =
      req.query;

    const products = await getProducts({
      categoryId,
      minPrice,
      maxPrice,
      condition,
      sortBy,
      search: q || search,
    });

    res.json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product:", error);

    res.status(500).json({
      error: "Failed to get product",
    });
  }
};

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, stock, condition, category_id } =
      req.body;

    if (!name || !condition || price === undefined || !category_id) {
      return res.status(400).json({
        error: "name, price, condition and category_id are required",
      });
    }

    const product = await createProduct({
      name,
      description,
      price,
      stock: stock ?? 0,
      condition,
      category_id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);

    res.status(500).json({
      error: "Failed to create product",
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, price, stock, condition, category_id } =
      req.body;

    if (
      !name ||
      !condition ||
      price === undefined ||
      stock === undefined ||
      !category_id
    ) {
      return res.status(400).json({
        error: "name, condition, price, stock, and category_id are required",
      });
    }

    const product = await updateProduct(id, {
      name,
      description,
      price,
      stock,
      condition,
      category_id,
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);

    res.status(500).json({
      error: "Failed to update product",
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Save image IDs before the database cascade deletes their records.
    const images = await getImagesByProductId(id);

    // 2. Delete the product from PostgreSQL.
    const product = await deleteProduct(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    // 3. Delete its images from Cloudinary.
    const results = await Promise.allSettled(
      images
        .filter((image) => image.public_id)
        .map((image) =>
          cloudinary.uploader.destroy(image.public_id, {
            resource_type: "image",
          }),
        ),
    );

    // 4. Detect cleanup failures without undoing product deletion.
    const cleanupFailed = results.some(
      (result) =>
        result.status === "rejected" ||
        !["ok", "not found"].includes(result.value?.result),
    );

    if (cleanupFailed) {
      console.error(
        `Cloudinary cleanup failed for product ${id}. Some images may remain.`,
      );
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      product,
      imageCleanupFailed: cleanupFailed,
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    return res.status(500).json({
      error: "Failed to delete product",
    });
  }
};
