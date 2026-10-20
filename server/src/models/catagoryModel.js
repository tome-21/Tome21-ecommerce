import { query } from "../config/db.js";

export const getAllCategories = async () => {
  const result = await query(`
    SELECT id, name, image_url
    FROM categories
    ORDER BY created_at DESC
  `);

  return result.rows;
};

export const getCategoryById = async (id) => {
  const result = await query(
    `
      SELECT id, name, image_url
      FROM categories
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

export const createCategory = async (name, image_url, public_id) => {
  const result = await query(
    ` INSERT INTO categories (name, image_url, public_id) VALUES ($1, $2, $3) RETURNING * `,
    [name, image_url, public_id],
  );
  return result.rows[0];
};

export const updateCategory = async (id, name, image_url, public_id) => {
  const result = await query(
    `
      UPDATE categories
      SET name = $1,
          image_url = $2,
          public_id = $3
      WHERE id = $4
      RETURNING *
    `,
    [name, image_url, public_id, id],
  );

  return result.rows[0] ?? null;
};

export const deleteCategory = async (id) => {
  const result = await query(
    `
      DELETE FROM categories
      WHERE id = $1
      RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};
