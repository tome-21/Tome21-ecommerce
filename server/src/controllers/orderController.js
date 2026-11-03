import {
  createOrderWithPayment,
  getOrdersByUserId,
  getOrderById,
} from "../models/orderModel.js";

export const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shipping_address,
      shipping_phone,
      payment_method,
      reference,
      account_suffix,
    } = req.body;

    // Basic validation
    if (!shipping_address?.trim() || !shipping_phone?.trim()) {
      return res
        .status(400)
        .json({ error: "Shipping address and phone are required" });
    }

    if (!payment_method || !["cbe", "telebirr"].includes(payment_method)) {
      return res
        .status(400)
        .json({ error: "Valid payment method (cbe or telebirr) is required" });
    }

    if (!reference?.trim()) {
      return res.status(400).json({ error: "Payment reference is required" });
    }

    const order = await createOrderWithPayment(
      userId,
      shipping_address.trim(),
      shipping_phone.trim(),
      {
        method: payment_method,
        reference: reference.trim(),
        accountSuffix: account_suffix?.trim(),
      },
    );

    return res.status(201).json({
      message: "Payment verified & order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    // Send clean error messages back to frontend client
    const clientErrors = [
      "Cart is empty",
      "Payment reference is required",
      "CBE account suffix is required",
      "Unsupported payment method",
      "This payment reference has already been used for another order",
    ];

    if (
      clientErrors.includes(error.message) ||
      error.message.startsWith("Not enough stock") ||
      error.message.startsWith("Paid amount")
    ) {
      return res.status(400).json({ error: error.message });
    }

    return res
      .status(500)
      .json({ error: "Checkout failed. Please try again." });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getOrdersByUserId(userId);

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);

    return res.status(500).json({
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
