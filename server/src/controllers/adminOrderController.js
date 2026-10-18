import {
  getAllOrders,
  getOrderByIdForAdmin,
  updateOrderStatus,
} from "../models/orderModel.js";

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await getAllOrders();

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting all orders:", error);

    res.status(500).json({
      error: "Failed to get orders",
    });
  }
};

export const getAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await getOrderByIdForAdmin(id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error getting admin order:", error);

    res.status(500).json({
      error: "Failed to get order",
    });
  }
};

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body?.status ?? "").toLowerCase();

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
      });
    }

    const existing = await getOrderByIdForAdmin(id);

    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (existing.status === "cancelled") {
      return res
        .status(409)
        .json({ error: "Cancelled orders can't be changed" });
    }

    if (existing.status === status) {
      return res.status(200).json(existing); // nothing to do
    }

    const updated = await updateOrderStatus(id, status);

    if (!updated) {
      return res.status(409).json({
        error: "Order was changed by someone else. Refresh and try again.",
      });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};
