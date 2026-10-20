import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  ConfirmDialog,
  btnGhost,
  btnPrimary,
  getErrorMessage,
  inputClass,
  useToast,
} from "../ui";

import ProductFormModal from "./ProductFormModal";
import ProductImagesModal from "./ProductImagesModal";
import {
  API_ENDPOINT,
  LOW_STOCK,
  money,
  withCreds,
} from "./productManagerUtils";

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
  const count = Number(stock);

  const [style, label] =
    count <= 0
      ? ["bg-rose-100 text-rose-700", "Out of stock"]
      : count <= LOW_STOCK
        ? ["bg-amber-100 text-amber-700", `${count} left`]
        : ["bg-green-100 text-green-700", `${count} in stock`];

  return (
    <span className={`rounded px-2 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function SkeletonRows() {
  return Array.from({ length: 5 }, (_, index) => (
    <tr key={index} className="animate-pulse">
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

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // undefined = closed; null = create; product object = edit
  const [formTarget, setFormTarget] = useState(undefined);
  const [imagesTarget, setImagesTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toastNode, notify] = useToast();

  const fetchAll = useCallback(async (signal) => {
    setLoadError("");

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        axios.get(`${API_ENDPOINT}/products`, { ...withCreds, signal }),
        axios.get(`${API_ENDPOINT}/categories`, { ...withCreds, signal }),
      ]);

      setProducts(
        Array.isArray(productResponse.data) ? productResponse.data : [],
      );
      setCategories(
        Array.isArray(categoryResponse.data) ? categoryResponse.data : [],
      );
    } catch (error) {
      if (axios.isCancel(error)) return;

      setLoadError(getErrorMessage(error, "Failed to load products"));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_ENDPOINT}/products`, withCreds);

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      notify(getErrorMessage(error, "Failed to refresh products"), "error");
    }
  }, [notify]);

  useEffect(() => {
    const controller = new AbortController();

    fetchAll(controller.signal);

    return () => controller.abort();
  }, [fetchAll]);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      if (categoryFilter && String(product.category_id) !== categoryFilter) {
        return false;
      }

      if (!search) return true;

      return (
        product.name?.toLowerCase().includes(search) ||
        product.category_name?.toLowerCase().includes(search)
      );
    });
  }, [products, query, categoryFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await axios.delete(
        `${API_ENDPOINT}/products/${deleteTarget.id}`,
        withCreds,
      );

      setProducts((current) =>
        current.filter(
          (product) => String(product.id) !== String(deleteTarget.id),
        ),
      );

      notify(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (error) {
      notify(getErrorMessage(error, "Failed to delete product"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (wasEditing) => {
    setFormTarget(undefined);
    notify(wasEditing ? "Product updated" : "Product created");
    refreshProducts();
  };

  const hasFilters = Boolean(query.trim() || categoryFilter);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products</h2>

          {!loading && !loadError && (
            <p className="text-sm text-slate-500">
              {hasFilters
                ? `${filteredProducts.length} of ${products.length} products`
                : `${products.length} ${
                    products.length === 1 ? "product" : "products"
                  }`}
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
      </header>

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
              onChange={(event) => setQuery(event.target.value)}
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
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={`${inputClass} pr-8`}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm text-rose-600">{loadError}</p>
            <button
              type="button"
              disabled={loading}
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
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-400"
                    >
                      {products.length === 0
                        ? "No products yet. Add your first one."
                        : "No products match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
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
                          className="rounded px-2 py-1 font-semibold text-sky-700 hover:bg-sky-50"
                        >
                          Images
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormTarget(product)}
                          className="ml-1 rounded px-2 py-1 font-semibold text-[#2f7d1b] hover:bg-green-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="ml-1 rounded px-2 py-1 font-semibold text-rose-600 hover:bg-rose-50"
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
