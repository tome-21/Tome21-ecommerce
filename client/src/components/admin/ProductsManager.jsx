import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ConfirmDialog,
  Modal,
  Spinner,
  btnGhost,
  btnPrimary,
  getErrorMessage,
  inputClass,
  labelClass,
  useToast,
} from "./ui";

const apiEndpoint = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LOW_STOCK = 5;
const money = (v) => `Br ${Number(v).toLocaleString()}`;
const withCreds = { withCredentials: true };

/* ---------- Small pieces ---------- */

function Thumb({ url, name, className = "h-10 w-10" }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        className={`${className} flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm font-bold text-slate-400`}
        aria-hidden="true"
      >
        {(name || "?").trim().charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-lg border border-slate-200 bg-white object-cover`}
    />
  );
}

function StockBadge({ stock }) {
  const n = Number(stock);
  const [style, label] =
    n <= 0
      ? ["bg-rose-100 text-rose-700", "Out of stock"]
      : n <= LOW_STOCK
        ? ["bg-amber-100 text-amber-700", `${n} left`]
        : ["bg-green-100 text-green-700", `${n} in stock`];
  return (
    <span className={`rounded px-2 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-slate-100" />
            <div className="h-3 w-12 rounded bg-slate-100" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-16 rounded bg-slate-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-20 rounded bg-slate-100" />
      </td>
      <td className="hidden px-6 py-4 md:table-cell">
        <div className="h-4 w-20 rounded bg-slate-100" />
      </td>
      <td className="px-6 py-4">
        <div className="ml-auto h-4 w-28 rounded bg-slate-100" />
      </td>
    </tr>
  ));
}

/* ---------- Main component ---------- */

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = new, object = edit
  const [imagesTarget, setImagesTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toastNode, notify] = useToast();

  const fetchAll = useCallback(async (signal) => {
    setLoadError("");
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${apiEndpoint}/products`, { ...withCreds, signal }),
        axios.get(`${apiEndpoint}/categories`, { ...withCreds, signal }),
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setLoadError(getErrorMessage(err, "Failed to load products"));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Quiet refresh after edits (no skeleton flash, errors ignored)
  const refreshProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiEndpoint}/products`, withCreds);
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      /* keep showing what we have */
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAll(controller.signal);
    return () => controller.abort();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter && String(p.category_id) !== categoryFilter)
        return false;
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q)
      );
    });
  }, [products, query, categoryFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(
        `${apiEndpoint}/products/${deleteTarget.id}`,
        withCreds,
      );
      setProducts((prev) =>
        prev.filter((p) => String(p.id) !== String(deleteTarget.id)),
      );
      notify(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete product"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (isEdit) => {
    setFormTarget(undefined);
    notify(isEdit ? "Product updated" : "Product created");
    refreshProducts();
  };

  const hasFilters = query.trim() || categoryFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products</h2>
          {!loading && !loadError && (
            <p className="text-sm text-slate-500">
              {hasFilters
                ? `${filtered.length} of ${products.length} products`
                : `${products.length} ${products.length === 1 ? "product" : "products"}`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFormTarget(null)}
          className={btnPrimary}
        >
          + Add product
        </button>
      </div>

      {/* Filters */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[12rem] flex-1 sm:max-w-xs">
            <label htmlFor="product-filter" className="sr-only">
              Search products
            </label>
            <input
              id="product-filter"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category…"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="product-category-filter" className="sr-only">
              Filter by category
            </label>
            <select
              id="product-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`${inputClass} pr-8`}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchAll();
              }}
              className={btnGhost}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Price</th>
                  <th className="px-6 py-3 font-semibold">Stock</th>
                  <th className="hidden px-6 py-3 font-semibold md:table-cell">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <SkeletonRows />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-slate-400"
                    >
                      {products.length === 0
                        ? "No products yet. Add your first one."
                        : "No products match your filters."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Thumb url={product.image_url} name={product.name} />
                          <div className="min-w-0">
                            <div className="max-w-[16rem] truncate font-medium text-slate-900">
                              {product.name}
                            </div>
                            {product.condition && (
                              <div className="text-xs capitalize text-slate-500">
                                {product.condition}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">{money(product.price)}</td>
                      <td className="px-6 py-3">
                        <StockBadge stock={product.stock} />
                      </td>
                      <td className="hidden px-6 py-3 md:table-cell">
                        {product.category_name || "—"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setImagesTarget(product)}
                          aria-label={`Manage images for ${product.name}`}
                          className="rounded px-2 py-1 font-semibold text-sky-700 transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                        >
                          Images
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormTarget(product)}
                          aria-label={`Edit ${product.name}`}
                          className="ml-1 rounded px-2 py-1 font-semibold text-[#2f7d1b] transition-colors hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          aria-label={`Delete ${product.name}`}
                          className="ml-1 rounded px-2 py-1 font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formTarget !== undefined && (
        <ProductFormModal
          product={formTarget}
          categories={categories}
          onClose={() => setFormTarget(undefined)}
          onSuccess={handleSaved}
        />
      )}

      {imagesTarget && (
        <ProductImagesModal
          product={imagesTarget}
          onClose={() => setImagesTarget(null)}
          onChanged={refreshProducts}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete product?"
          message={`"${deleteTarget.name}" and its images will be permanently deleted.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toastNode}
    </div>
  );
}

/* ---------- Create / edit modal ---------- */

function ProductFormModal({ product, categories, onClose, onSuccess }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    // "4500.00" -> "4500" so the number input looks clean
    price: product?.price != null ? String(Number(product.price)) : "",
    // `??` not `||`, so a stock of 0 stays 0
    stock: product?.stock != null ? String(product.stock) : "",
    condition: product?.condition ?? "new",
    category_id:
      product?.category_id != null ? String(product.category_id) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name) return setError("Product name is required");
    if (!Number.isFinite(price) || price < 0)
      return setError("Enter a valid price");
    if (!Number.isInteger(stock) || stock < 0)
      return setError("Stock must be a whole number, 0 or more");

    setSaving(true);
    setError("");
    const payload = {
      name,
      description: form.description.trim(),
      price,
      stock,
      condition: form.condition,
      category_id: Number(form.category_id),
    };

    try {
      if (isEdit) {
        await axios.put(
          `${apiEndpoint}/products/${product.id}`,
          payload,
          withCreds,
        );
      } else {
        await axios.post(`${apiEndpoint}/products`, payload, withCreds);
      }
      onSuccess(isEdit);
    } catch (err) {
      setError(getErrorMessage(err, "Error saving product"));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit product" : "New product"}
      onClose={onClose}
      busy={saving}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label htmlFor="product-name" className={labelClass}>
            Name
          </label>
          <input
            id="product-name"
            autoFocus
            required
            type="text"
            value={form.name}
            onChange={set("name")}
            className={inputClass}
            placeholder="e.g. Nike Air Max"
          />
        </div>

        <div>
          <label htmlFor="product-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="product-description"
            required
            rows={3}
            value={form.description}
            onChange={set("description")}
            className={`${inputClass} resize-none`}
            placeholder="A short description shoppers will see"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-price" className={labelClass}>
              Price (Br)
            </label>
            <input
              id="product-price"
              required
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.price}
              onChange={set("price")}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="product-stock" className={labelClass}>
              Stock
            </label>
            <input
              id="product-stock"
              required
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.stock}
              onChange={set("stock")}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-condition" className={labelClass}>
              Condition
            </label>
            <select
              id="product-condition"
              value={form.condition}
              onChange={set("condition")}
              className={inputClass}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
          <div>
            <label htmlFor="product-category" className={labelClass}>
              Category
            </label>
            <select
              id="product-category"
              required
              value={form.category_id}
              onChange={set("category_id")}
              className={inputClass}
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {categories.length === 0 && (
          <p className="text-xs text-amber-700">
            No categories exist yet. Create one in the Categories tab first.
          </p>
        )}

        {!isEdit && (
          <p className="text-xs text-slate-500">
            You can add photos after saving, using the Images button.
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={btnGhost}
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving && <Spinner />}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Images modal ---------- */

const sortImages = (list) =>
  [...list].sort(
    (a, b) =>
      Number(a.sort_order) - Number(b.sort_order) ||
      Number(a.id) - Number(b.id),
  );

function ProductImagesModal({ product, onClose, onChanged }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null); // image being deleted
  const [confirmId, setConfirmId] = useState(null); // inline "sure?" row
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { data } = await axios.get(
          `${apiEndpoint}/product-images/product/${product.id}`,
          { ...withCreds, signal: controller.signal },
        );
        setImages(sortImages(Array.isArray(data) ? data : []));
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(getErrorMessage(err, "Failed to load images"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [product.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) return;

    setAdding(true);
    setError("");
    // max + 1 (not images.length) so deleted gaps can't create duplicate orders
    const nextOrder = images.length
      ? Math.max(...images.map((i) => Number(i.sort_order) || 0)) + 1
      : 0;

    try {
      const { data } = await axios.post(
        `${apiEndpoint}/product-images/product/${product.id}`,
        { image_url: url, sort_order: nextOrder },
        withCreds,
      );
      setImages((prev) => sortImages([...prev, data]));
      setNewUrl("");
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add image"));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await axios.delete(`${apiEndpoint}/product-images/${id}`, withCreds);
      setImages((prev) => prev.filter((i) => String(i.id) !== String(id)));
      setConfirmId(null);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete image"));
    } finally {
      setBusyId(null);
    }
  };

  // Swap with a neighbour; the first image is the one shown in the product list
  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= images.length || reordering) return;

    const previous = images;
    const swapped = [...images];
    [swapped[index], swapped[target]] = [swapped[target], swapped[index]];
    const next = swapped.map((img, i) => ({ ...img, sort_order: i }));

    const oldOrder = new Map(previous.map((i) => [i.id, Number(i.sort_order)]));
    const changed = next.filter(
      (img) => oldOrder.get(img.id) !== img.sort_order,
    );

    setImages(next); // optimistic
    setReordering(true);
    setError("");
    try {
      await Promise.all(
        changed.map((img) =>
          axios.put(
            `${apiEndpoint}/product-images/${img.id}`,
            { image_url: img.image_url, sort_order: img.sort_order },
            withCreds,
          ),
        ),
      );
      onChanged();
    } catch (err) {
      setImages(previous);
      setError(getErrorMessage(err, "Failed to reorder images"));
    } finally {
      setReordering(false);
    }
  };

  const iconBtn =
    "flex h-7 w-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24]";

  return (
    <Modal
      title={`Images · ${product.name}`}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="p-6">
        <form onSubmit={handleAdd} className="mb-2 flex gap-2">
          <label htmlFor="new-image-url" className="sr-only">
            Image URL
          </label>
          <input
            id="new-image-url"
            autoFocus
            required
            type="url"
            placeholder="Paste image URL…"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className={`${inputClass} flex-1`}
          />
          <button type="submit" disabled={adding} className={btnPrimary}>
            {adding && <Spinner />}
            Add
          </button>
        </form>

        {error && (
          <p role="alert" className="mb-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <p className="mb-4 text-xs text-slate-500">
          The first image is the main photo. Use the arrows to reorder.
        </p>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Loading images…
            </p>
          ) : images.length === 0 ? (
            <p className="rounded-lg border-2 border-dashed border-slate-100 py-6 text-center text-sm text-slate-400">
              No images yet.
            </p>
          ) : (
            images.map((img, i) => (
              <div
                key={img.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2"
              >
                <Thumb url={img.image_url} name="img" className="h-12 w-12" />

                <div className="min-w-0 flex-1">
                  {i === 0 && (
                    <span className="mb-0.5 inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                      Main
                    </span>
                  )}
                  <div
                    className="truncate text-xs text-slate-500"
                    title={img.image_url}
                  >
                    {img.image_url}
                  </div>
                </div>

                {confirmId === img.id ? (
                  <div className="flex shrink-0 items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      disabled={busyId === img.id}
                      className="rounded bg-rose-600 px-2 py-1 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {busyId === img.id ? "…" : "Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      disabled={busyId === img.id}
                      className="rounded px-2 py-1 font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0 || reordering}
                      aria-label="Move up"
                      className={iconBtn}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === images.length - 1 || reordering}
                      aria-label="Move down"
                      className={iconBtn}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(img.id)}
                      aria-label="Delete image"
                      className="flex h-7 w-7 items-center justify-center rounded text-lg leading-none text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
