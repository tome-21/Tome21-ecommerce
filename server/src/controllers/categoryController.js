import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../models/catagoryModel.js";
import cloudinary from "../config/cloudinary.js";
import {
  uploadImage,
  deleteCloudinaryImage,
} from "../services/cloudinaryService.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);

    res.status(500).json({
      error: "Failed to get categories",
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error getting category:", error);

    res.status(500).json({
      error: "Failed to get category",
    });
  }
};

export const createCategoryController = async (req, res) => {
  let uploadedImage;

  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        error: "Category name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Category image is required",
      });
    }

    uploadedImage = await uploadImage(req.file.buffer, "categories");

    const category = await createCategory(
      name,
      uploadedImage.image_url,
      uploadedImage.public_id,
    );

    const { public_id, ...categoryData } = category;

    return res.status(201).json({
      message: "Category created successfully",
      data: categoryData,
    });
  } catch (error) {
    // Clean up an uploaded image if saving the category failed.
    if (uploadedImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    console.error("Error creating category:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "A category with this name already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to create category",
    });
  }
};
export const updateCategoryController = async (req, res) => {
  let uploadedImage;

  try {
    const { id } = req.params;
    const currentCategory = await getCategoryById(id);

    if (!currentCategory) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    const name = req.body.name?.trim() || currentCategory.name;

    if (!req.body.name?.trim() && !req.file) {
      return res.status(400).json({
        error: "Provide a category name or a new image",
      });
    }

    let image_url = currentCategory.image_url;
    let public_id = currentCategory.public_id;

    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, "categories");

      image_url = uploadedImage.image_url;
      public_id = uploadedImage.public_id;
    }

    const category = await updateCategory(id, name, image_url, public_id);

    // The database update succeeded. Now clean up the old image.
    if (
      uploadedImage &&
      currentCategory.public_id &&
      currentCategory.public_id !== uploadedImage.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(currentCategory.public_id);
      } catch (cleanupError) {
        console.error("Old category image cleanup failed:", cleanupError);
      }
    }

    const { public_id: savedPublicId, ...categoryData } = category;

    return res.status(200).json({
      message: "Category updated successfully",
      data: categoryData,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error("New category image cleanup failed:", cleanupError);
      }
    }

    console.error("Error updating category:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "A category with this name already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update category",
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the category from PostgreSQL first.
    const category = await deleteCategory(id);

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    let imageCleanupFailed = false;

    // Delete the corresponding Cloudinary image.
    if (category.public_id) {
      try {
        await deleteCloudinaryImage(category.public_id);
      } catch (cleanupError) {
        imageCleanupFailed = true;
        console.error(
          "Cloudinary category image cleanup failed:",
          cleanupError,
        );
      }
    }

    return res.status(200).json({
      message: imageCleanupFailed
        ? "Category deleted, but image cleanup failed"
        : "Category deleted successfully",
      data: category,
      imageCleanupFailed,
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        error:
          "Cannot delete this category because it is referenced by other records.",
      });
    }

    return res.status(500).json({
      error: "Failed to delete category",
    });
  }
};
