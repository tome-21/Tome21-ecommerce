import {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getProducts,
} from "../models/productModel.js";

import { deleteCloudinaryImage } from "../services/cloudinaryService.js";
import { getImagesByProductId } from "../models/productImageModel.js";

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await getTopProducts();

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error getting products:", error);

    return res.status(500).json({
      error: "Failed to get products",
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

    return res.status(200).json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return res.status(500).json({
      error: "Server error",
    });
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

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product:", error);

    return res.status(500).json({
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

    return res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);

    return res.status(500).json({
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

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);

    return res.status(500).json({
      error: "Failed to update product",
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch associated image records before deleting the product.
    const images = await getImagesByProductId(id);

    const product = await deleteProduct(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    let imageCleanupFailed = false;

    // Clean up associated Cloudinary images after deleting the product.
    for (const image of images) {
      if (!image.public_id) {
        imageCleanupFailed = true;

        console.error(`Image ${image.id} has no public_id`);
        continue;
      }

      try {
        await deleteCloudinaryImage(image.public_id);
      } catch (cleanupError) {
        imageCleanupFailed = true;

        console.error(
          `Failed to delete Cloudinary image ${image.public_id}:`,
          cleanupError,
        );
      }
    }

    return res.status(200).json({
      message: imageCleanupFailed
        ? "Product deleted, but some Cloudinary images could not be cleaned up"
        : "Product deleted successfully",
      product,
      imageCleanupFailed,
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        error:
          "Cannot delete this product because it is referenced by other records.",
      });
    }

    return res.status(500).json({
      error: "Failed to delete product",
    });
  }
};
