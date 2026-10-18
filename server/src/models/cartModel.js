import { query } from "../config/db.js";

export const getCartByUserId = async (userId) => {
  const result = await query(
    `
      SELECT
        ci.id,
        ci.product_id,
        p.name,
        p.price,
        p.stock,
        ci.quantity,
        (p.price * ci.quantity) AS subtotal,

        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS image_url

      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id

      WHERE ci.user_id = $1
      ORDER BY ci.id DESC
    `,
    [userId],
  );

  const items = result.rows;

  const totalResult = await query(
    `
      SELECT COALESCE(SUM(p.price * ci.quantity), 0) AS total
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.user_id = $1
    `,
    [userId],
  );

  return {
    items,
    total: totalResult.rows[0].total,
  };
};

export const addCartItem = async (userId, productId, quantity) => {
  const result = await query(
    `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)

      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity

      RETURNING *
    `,
    [userId, productId, quantity],
  );

  return result.rows[0];
};

export const updateCartItem = async (userId, productId, quantity) => {
  console.log({ userId, productId, quantity });

  const result = await query(
    `UPDATE cart_items
     SET quantity = $1
     WHERE user_id = $2
       AND product_id = $3
     RETURNING *`,
    [quantity, userId, productId],
  );


  return result.rows[0] ?? null;
};

export const removeCartItem = async (userId, productId) => {
  console.log({ userId, productId });

  const result = await query(
    `DELETE FROM cart_items
     WHERE user_id = $1
       AND product_id = $2
     RETURNING *`,
    [userId, productId],
  );


  return result.rows[0] ?? null;
};

export const clearCart = async (userId) => {
  await query(
    `
      DELETE FROM cart_items
      WHERE user_id = $1
    `,
    [userId],
  );
};
