import cloudinary from "../config/cloudinary.js";
import { uploadImage } from "../services/cloudinaryService.js";

import {
  getImagesByProductId,
  getImageById,
  createProductImage,
  updateProductImage,
  deleteProductImage,
} from "../models/productImageModel.js";

// GET /product-images/product/:productId
export const getProductImages = async (req, res) => {
  try {
    const images = await getImagesByProductId(req.params.productId);

    return res.status(200).json(images.map(hidePublicId));
  } catch (error) {
    console.error("Error getting product images:", error);
    return res.status(500).json({ error: "Failed to get product images" });
  }
};

// GET /product-images/:id
export const getProductImage = async (req, res) => {
  try {
    const image = await getImageById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Product image not found" });
    }

    return res.status(200).json(hidePublicId(image));
  } catch (error) {
    console.error("Error getting product image:", error);
    return res.status(500).json({ error: "Failed to get product image" });
  }
};

// POST /product-images/product/:productId
export const createProductImageController = async (req, res) => {
  let uploadedImage;

  try {
    const { productId } = req.params;
    const sortOrder = Number(req.body.sort_order ?? 0);

    if (!req.file) {
      return res.status(400).json({ error: "Please select an image" });
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return res.status(400).json({
        error: "sort_order must be a non-negative integer",
      });
    }

    uploadedImage = await uploadImage(req.file.buffer, "products");

    const image = await createProductImage(
      productId,
      uploadedImage.image_url,
      uploadedImage.public_id,
      sortOrder,
    );

    return res.status(201).json({
      message: "Product image uploaded successfully",
      data: hidePublicId(image),
    });
  } catch (error) {
    // If the database insert fails, clean up the newly uploaded image.
    if (uploadedImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id, {
          resource_type: "image",
        });
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    console.error("Error creating product image:", error);

    if (error.code === "23503") {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(500).json({ error: "Failed to upload product image" });
  }
};

// PUT /product-images/:id
export const updateProductImageController = async (req, res) => {
  let uploadedImage;

  try {
    const { id } = req.params;
    const currentImage = await getImageById(id);

    if (!currentImage) {
      return res.status(404).json({ error: "Product image not found" });
    }

    const sortOrder =
      req.body.sort_order === undefined
        ? currentImage.sort_order
        : Number(req.body.sort_order);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return res.status(400).json({
        error: "sort_order must be a non-negative integer",
      });
    }

    // Upload a replacement only if the request contains a new file.
    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, "products");
    }

    const imageUrl = uploadedImage?.image_url ?? currentImage.image_url;
    const publicId = uploadedImage?.public_id ?? currentImage.public_id;

    const updatedImage = await updateProductImage(
      id,
      imageUrl,
      publicId,
      sortOrder,
    );

    if (!updatedImage) {
      // Unlikely, but clean up the new asset if the row disappeared.
      if (uploadedImage?.public_id) {
        await cloudinary.uploader.destroy(uploadedImage.public_id, {
          resource_type: "image",
        });
      }

      return res.status(404).json({ error: "Product image not found" });
    }

    // Delete the old Cloudinary image only after the database update succeeds.
    let imageCleanupFailed = false;

    if (
      uploadedImage &&
      currentImage.public_id &&
      currentImage.public_id !== uploadedImage.public_id
    ) {
      try {
        const result = await cloudinary.uploader.destroy(
          currentImage.public_id,
          { resource_type: "image" },
        );

        if (result.result !== "ok" && result.result !== "not found") {
          imageCleanupFailed = true;
          console.error("Old product image cleanup failed:", result);
        }
      } catch (cleanupError) {
        imageCleanupFailed = true;
        console.error("Old product image cleanup failed:", cleanupError);
      }
    }

    return res.status(200).json({
      message: imageCleanupFailed
        ? "Product image updated, but old image cleanup failed"
        : "Product image updated successfully",
      data: hidePublicId(updatedImage),
      imageCleanupFailed,
    });
  } catch (error) {
    // Only delete the new upload if the update failed before succeeding.
    if (uploadedImage?.public_id) {
      try {
        const currentImage = await getImageById(req.params.id);

        // If the DB now points at this upload, do not delete it.
        if (currentImage?.public_id !== uploadedImage.public_id) {
          await cloudinary.uploader.destroy(uploadedImage.public_id, {
            resource_type: "image",
          });
        }
      } catch (cleanupError) {
        console.error("New product image cleanup failed:", cleanupError);
      }
    }

    console.error("Error updating product image:", error);
    return res.status(500).json({ error: "Failed to update product image" });
  }
};

// DELETE /product-images/:id
export const deleteProductImageController = async (req, res) => {
  try {
    const image = await deleteProductImage(req.params.id);

    if (!image) {
      return res.status(404).json({
        error: "Product image not found",
      });
    }

    let imageCleanupFailed = false;

    // Delete the image from Cloudinary.
    if (image.public_id) {
      try {
        await deleteCloudinaryImage(image.public_id);
      } catch (cleanupError) {
        imageCleanupFailed = true;
        console.error("Cloudinary product image cleanup failed:", cleanupError);
      }
    }

    return res.status(200).json({
      message: imageCleanupFailed
        ? "Product image deleted, but Cloudinary cleanup failed"
        : "Product image deleted successfully",
      data: image,
      imageCleanupFailed,
    });
  } catch (error) {
    console.error("Error deleting product image:", error);

    return res.status(500).json({
      error: "Failed to delete product image",
    });
  }
};
