import {
  createOrder,
  getOrdersByUserId,
  getOrderById,
} from "../models/orderModel.js";

export const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address, shipping_phone } = req.body;

    if (
      !shipping_address ||
      !shipping_address.trim() ||
      !shipping_phone ||
      !shipping_phone.trim()
    ) {
      return res.status(400).json({
        error: "shipping_address is required",
      });
    }

    const order = await createOrder(
      userId,
      shipping_address.trim(),
      shipping_phone.trim(),
    );

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);

    if (error.message === "Cart is empty") {
      return res.status(400).json({
        error: "Cart is empty",
      });
    }

    if (error.message.startsWith("Not enough stock")) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to create order",
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await getOrdersByUserId(userId);

    if (orders.length === 0) {
      return res.status(404).json({
        error: "You don't have any orders",
      });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);

    res.status(500).json({
      error: "Failed to get orders",
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await getOrderById(userId, id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error getting order:", error);

    res.status(500).json({
      error: "Failed to get order",
    });
  }
};
