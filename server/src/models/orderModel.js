import { getClient, query } from "../config/db.js";
import { verifyPayment } from "../services/paymentService.js";

export const createOrderWithPayment = async (
  userId,
  shippingAddress,
  shippingPhone,
  paymentData,
) => {
  try {
    const verification = await verifyPayment({
      method: paymentData.method,
      reference: paymentData.reference,
      accountSuffix: paymentData.accountSuffix,
    });
    const client = await getClient();

    await client.query("BEGIN");

    const cartResult = await client.query(
      `
        SELECT
          ci.product_id,
          ci.quantity,
          p.price,
          p.stock
        FROM cart_items ci
        JOIN products p
          ON p.id = ci.product_id
        WHERE ci.user_id = $1
        ORDER BY p.id
        FOR UPDATE OF p
      `,
      [userId],
    );

    const cartItems = cartResult.rows;
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        throw new Error(`Not enough stock for product ID ${item.product_id}`);
      }

      totalAmount += Number(item.price) * item.quantity;
    }

    if (Math.abs(verification.verifiedAmount - totalAmount) > 0.01) {
      throw new Error(
        `Paid amount (${verification.verifiedAmount}) does not match order total (${totalAmount})`,
      );
    }

    const orderResult = await client.query(
      `
        INSERT INTO orders (
          user_id,
          total_amount,
          shipping_address,
          shipping_phone,
          payment_status,
          payment_method,
          payment_reference,
          status
        )
        VALUES ($1, $2, $3, $4, 'paid', $5, $6, 'confirmed')
        RETURNING *
      `,
      [
        userId,
        totalAmount,
        shippingAddress,
        shippingPhone,
        paymentData.method,
        verification.reference,
      ],
    );

    const order = orderResult.rows[0];

    for (const item of cartItems) {
      await client.query(
        `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `,
        [order.id, item.product_id, item.quantity, item.price],
      );

      await client.query(
        `
          UPDATE products
          SET stock = stock - $1, updated_at = NOW()
          WHERE id = $2
        `,
        [item.quantity, item.product_id],
      );
    }

    await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getOrdersByUserId = async (userId) => {
  const result = await query(
    `
      SELECT
        id,
        total_amount,
        status,
        shipping_address,
        shipping_phone,
        created_at,
        updated_at,
        payment_status,
        payment_method,
        payment_reference
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

export const getOrderById = async (userId, orderId) => {
  const orderResult = await query(
    `
      SELECT
        id,
        total_amount,
        status,
        shipping_address,
        shipping_phone,
        created_at,
        updated_at
      FROM orders
      WHERE id = $1
        AND user_id = $2
    `,
    [orderId, userId],
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  const itemsResult = await query(
    `
      SELECT
        oi.id,
        oi.product_id,
        p.name,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) AS subtotal
      FROM order_items oi
      JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `,
    [orderId],
  );

  return {
    ...orderResult.rows[0],
    items: itemsResult.rows,
  };
};

export const getAllOrders = async () => {
  const result = await query(
    `
      SELECT
        o.id,
        o.user_id,
        u.name AS customer_name,
        u.email AS customer_email,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.shipping_phone,
        o.payment_status,
        o.payment_method,
        o.payment_reference,
        o.created_at,
        o.updated_at
      FROM orders o
      JOIN users u
        ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `,
  );

  return result.rows;
};

export const getOrderByIdForAdmin = async (orderId) => {
  const orderResult = await query(
    `
      SELECT
        o.id,
        o.user_id,
        u.name AS customer_name,
        u.email AS customer_email,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.shipping_phone,
        o.payment_status,
        o.payment_method,
        o.payment_reference,
        o.created_at,
        o.updated_at
      FROM orders o
      JOIN users u
        ON u.id = o.user_id
      WHERE o.id = $1
    `,
    [orderId],
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  const itemsResult = await query(
    `
      SELECT
        oi.id,
        oi.product_id,
        p.name,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) AS subtotal
      FROM order_items oi
      JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `,
    [orderId],
  );

  return {
    ...orderResult.rows[0],
    items: itemsResult.rows,
  };
};

export const updateOrderStatus = async (orderId, status) => {
  const isCancel = status === "cancelled";

  const result = await query(
    `
      WITH target AS (
        SELECT id, status
        FROM orders
        WHERE id = $2
        FOR UPDATE
      ),
      restock AS (
        UPDATE products p
        SET stock = p.stock + items.qty
        FROM (
          SELECT oi.product_id, SUM(oi.quantity) AS qty
          FROM order_items oi
          WHERE oi.order_id = $2
          GROUP BY oi.product_id
        ) items, target
        WHERE $3::boolean
          AND target.status <> 'cancelled'
          AND p.id = items.product_id
      )
      UPDATE orders o
      SET status = $1, updated_at = NOW()
      FROM target
      WHERE o.id = target.id
        AND target.status <> 'cancelled'
      RETURNING o.*
    `,
    [status, orderId, isCancel],
  );

  return result.rows[0] || null;
};
