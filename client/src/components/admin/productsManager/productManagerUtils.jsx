
export const API_ENDPOINT =
  import.meta.env.VITE_API_URL;

export const withCreds = { withCredentials: true };

export const LOW_STOCK = 5;

export const money = (value) =>
  `Br ${Number(value).toLocaleString()}`;

export const sortImages = (images) =>
  [...images].sort(
    (a, b) =>
      Number(a.sort_order) - Number(b.sort_order) ||
      Number(a.id) - Number(b.id),
  );

export const isValidImage = (file) =>
  Boolean(file) &&
  file.type.startsWith("image/") &&
  file.size <= 5 * 1024 * 1024;
