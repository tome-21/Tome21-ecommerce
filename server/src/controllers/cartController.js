import {
  addCartItem,
  updateCartItem,
  getCartItem,
  getCartByUserId,
  removeCartItem,
  clearCart,
} from "../models/cartModel.js";
import { getProductById } from "../models/productModel.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        error: "product id and quantity are required",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: "quantity must be positive number",
      });
    }

    const item = await addCartItem(userId, productId, quantity);

    if (!item) {
      const product = await getProductById(productId);
      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }
      return res.status(400).json({
        error: "Not enough stock for this product",
      });
    }

    return res.status(201).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "server error",
    });
  }
};

export const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        error: "Product id and quantity are required",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: "quantity must be positive number",
      });
    }

    const item = await updateCartItem(userId, productId, quantity);

    if (!item) {
      const product = await getProductById(productId);
      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }
      const cartItem = await getCartItem(userId, productId);
      if (!cartItem) {
        return res.status(404).json({
          error: "This item is not in your cart",
        });
      }
      return res.status(400).json({
        error: "Not enough stock for this product",
      });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "server error",
    });
  }
};

export const getCartByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getCartByUserId(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "server error",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        error: "product id is required",
      });
    }

    const item = await removeCartItem(userId, productId);

    if (!item) {
      return res.status(404).json({
        error: "this product is not in your cart",
      });
    }
    return res.status(200).json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "server error",
    });
  }
};

export const clearUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await clearCart(userId);

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "server error",
    });
  }
};
