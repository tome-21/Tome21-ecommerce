import { query } from "../config/db.js";

export const addCartItem = async (userId, productId, quantity) => {
  const result = await query(
    `insert into cart_items(user_id, product_id, quantity)
        select $1, $2, $3 from products where id = $2 and stock >= $3
        on conflict (user_id, product_id)
        do update set quantity = cart_items.quantity + excluded.quantity
        where cart_items.quantity + excluded.quantity <= (select stock from products where id = excluded.product_id)
        returning *;`,
    [userId, productId, quantity],
  );
  return result.rows[0];
};

export const updateCartItem = async (userId, productId, quantity) => {
  const result = await query(
    `update cart_items
    set quantity = $3
    where user_id = $1 and product_id = $2 and $3 <= (select stock from products where id = $2) returning *;`,
    [userId, productId, quantity],
  );

  return result.rows[0];
};

export const getCartItem = async (userId, productId) => {
  const result = await query(
    `select id, user_id, product_id, quantity 
    from cart_items where user_id = $1 and product_id = $2;`,
    [userId, productId],
  );

  return result.rows[0];
};

export const getCartByUserId = async (userId) => {
  const result = await query(
    `select cart_items.id, cart_items.user_id, cart_items.product_id, cart_items.quantity, products.name, products.price, products.stock, (products.price * cart_items.quantity) as subtotal, (select image_url from product_images where product_id = cart_items.product_id order by sort_order limit 1) as image_url from cart_items 
    join products on products.id = cart_items.product_id
    where cart_items.user_id = $1;`,
    [userId],
  );

  const total = await query(
    `select coalesce(sum(products.price * cart_items.quantity), 0) as total from cart_items
  join products on products.id = cart_items.product_id
  where cart_items.user_id = $1`,
    [userId],
  );

  return { items: result.rows, total: total.rows[0].total };
};

export const removeCartItem = async (userId, productId) => {
  const result = await query(
    `delete from cart_items where user_id = $1 and product_id = $2 returning *;`,
    [userId, productId],
  );

  return result.rows[0];
};

export const clearCart = async (userId) => {
  const result = await query(
    `delete from cart_items where user_id = $1 returning *;`,
    [userId],
  );

  return result.rows;
};
