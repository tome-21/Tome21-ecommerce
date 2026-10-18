import { query } from "../config/db.js";

export const getTopProducts = async () => {
  const result = await query(`
    SELECT
      p.id,
      p.name,
      p.price,
      p.category_id,
      c.name AS category_name,

      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.sort_order ASC, pi.id ASC
        LIMIT 1
      ) AS image_url,

      p.created_at,
      p.updated_at

    FROM products p
    JOIN categories c
      ON p.category_id = c.id

    ORDER BY p.created_at DESC
    LIMIT 8
  `);

  return result.rows;
};

export const getProducts = async ({
  categoryId,
  minPrice,
  maxPrice,
  condition,
  sortBy = "newest",
  search, // 1. Accept search/q from controller query params
}) => {
  const conditions = [];
  const values = [];

  const addCondition = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  };

  if (categoryId) {
    addCondition("p.category_id = ?", categoryId);
  }

  if (minPrice !== undefined && minPrice !== "") {
    addCondition("p.price >= ?", minPrice);
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    addCondition("p.price <= ?", maxPrice);
  }

  if (condition) {
    addCondition("p.condition = ?", condition);
  }

  // 2. Add keyword search condition for name and description
  if (search && search.trim() !== "") {
    values.push(`%${search.trim()}%`);
    conditions.push(
      `(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`,
    );
  }

  const sortOptions = {
    newest: "p.created_at DESC",
    price_asc: "p.price ASC",
    price_desc: "p.price DESC",
  };

  const orderBy = sortOptions[sortBy] || sortOptions.newest;

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await query(
    `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.category_id,
        c.name AS category_name,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS image_url,
        p.created_at,
        p.updated_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
    `,
    values,
  );

  return result.rows;
};

export const getProductById = async (id) => {
  const productResult = await query(
    `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        P.condition,
        p.category_id,
        c.name AS category_name,
        p.created_at,
        p.updated_at
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = $1
    `,
    [id],
  );

  if (productResult.rows.length === 0) {
    return null;
  }

  const imageResult = await query(
    `
      SELECT
        id,
        image_url,
        sort_order
      FROM product_images
      WHERE product_id = $1
      ORDER BY sort_order ASC, id ASC
    `,
    [id],
  );

  return {
    ...productResult.rows[0],
    images: imageResult.rows,
  };
};

export const createProduct = async ({
  name,
  description,
  price,
  stock,
  condition,
  category_id,
}) => {
  const result = await query(
    `
      INSERT INTO products (
        name,
        description,
        price,
        stock,
        condition,
        category_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [name, description, price, stock, condition, category_id],
  );

  return result.rows[0];
};

export const updateProduct = async (
  id,
  { name, description, price, stock, condition, category_id },
) => {
  const result = await query(
    `
      UPDATE products
      SET
        name = $1,
        description = $2,
        price = $3,
        stock = $4,
        condition = $5,
        category_id = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `,
    [name, description, price, stock, condition, category_id, id],
  );

  return result.rows[0];
};

export const deleteProduct = async (id) => {
  const result = await query(
    `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};
