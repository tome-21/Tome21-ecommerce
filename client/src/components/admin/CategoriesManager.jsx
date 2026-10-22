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

/* ---------- Small pieces ---------- */

function Thumb({ url, name, className = "h-10 w-10" }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        className={`${className} flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-400`}
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
      className={`${className} shrink-0 rounded-full border border-slate-200 bg-white object-cover`}
    />
  );
}

function SkeletonRows() {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="hidden px-6 py-4 sm:table-cell">
        <div className="h-4 w-6 rounded bg-slate-100" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100" />
          <div className="h-4 w-32 rounded bg-slate-100" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="ml-auto h-4 w-24 rounded bg-slate-100" />
      </td>
    </tr>
  ));
}

/* ---------- Main component ---------- */

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");

  const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = new, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toastNode, notify] = useToast();

  const fetchCategories = useCallback(async (signal) => {
    setLoadError("");
    try {
      const { data } = await axios.get(`${apiEndpoint}/categories`, {
        withCredentials: true,
        signal,
      });
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setLoadError(getErrorMessage(err, "Failed to load categories"));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, [fetchCategories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [categories, query]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const { data } = await axios.delete(
        `${apiEndpoint}/categories/${deleteTarget.id}`,
        { withCredentials: true },
      );

      setCategories((prev) =>
        prev.filter((c) => String(c.id) !== String(deleteTarget.id)),
      );

      notify(
        data.imageCleanupFailed
          ? `"${deleteTarget.name}" deleted, but its image cleanup failed`
          : `"${deleteTarget.name}" deleted`,
        data.imageCleanupFailed ? "error" : undefined,
      );

      setDeleteTarget(null);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete category"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (isEdit) => {
    setFormTarget(undefined);
    notify(isEdit ? "Category updated" : "Category created");
    fetchCategories(); // quiet refetch, no skeleton flash
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
          {!loading && !loadError && (
            <p className="text-sm text-slate-500">
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFormTarget(null)}
          className={btnPrimary}
        >
          + Add category
        </button>
      </div>

      {/* Search */}
      {categories.length > 0 && (
        <div className="max-w-xs">
          <label htmlFor="category-filter" className="sr-only">
            Filter categories
          </label>
          <input
            id="category-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name…"
            className={inputClass}
          />
        </div>
      )}

      {/* Table */}
      <div className="max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchCategories();
              }}
              className={btnGhost}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
                <tr>
                  <th className="hidden w-16 px-6 py-3 font-semibold sm:table-cell">
                    ID
                  </th>
                  <th className="px-6 py-3 font-semibold">Category</th>
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
                      colSpan="3"
                      className="px-6 py-10 text-center text-slate-400"
                    >
                      {categories.length === 0
                        ? "No categories yet. Add your first one."
                        : `No categories match "${query}".`}
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="hidden px-6 py-3 text-slate-400 sm:table-cell">
                        {cat.id}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Thumb url={cat.image_url} name={cat.name} />
                          <span className="font-medium text-slate-900">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setFormTarget(cat)}
                          aria-label={`Edit ${cat.name}`}
                          className="rounded px-2 py-1 font-semibold text-[#2f7d1b] transition-colors hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(cat)}
                          aria-label={`Delete ${cat.name}`}
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
        <CategoryFormModal
          category={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSuccess={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete category?"
          message={`"${deleteTarget.name}" will be permanently deleted. Products in this category may be affected.`}
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

function CategoryFormModal({ category, onClose, onSuccess }) {
  const isEdit = Boolean(category);

  const [name, setName] = useState(category?.name || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(category?.image_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Clean up temporary preview URLs created by the browser.
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    if (!isEdit && !selectedFile) {
      setError("Please select a category image.");
      return;
    }

    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("name", trimmedName);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      if (isEdit) {
        await axios.put(`${apiEndpoint}/categories/${category.id}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${apiEndpoint}/categories`, formData, {
          withCredentials: true,
        });
      }

      onSuccess(isEdit);
    } catch (err) {
      setError(getErrorMessage(err, "Error saving category"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit category" : "New category"}
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6" noValidate>
        {/* Image preview */}
        <div className="flex flex-col items-center gap-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Category preview"
              className="h-28 w-28 rounded-xl border border-slate-200 bg-white object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
              No image
            </div>
          )}

          <div className="w-full">
            <label htmlFor="category-image" className={labelClass}>
              Category image
              {!isEdit && (
                <span className="font-normal normal-case"> (required)</span>
              )}
            </label>

            <input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={saving}
              className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold`}
            />

            <p className="mt-1 text-xs text-slate-500">
              {selectedFile
                ? selectedFile.name
                : isEdit
                  ? "Choose a new image only if you want to replace the current one."
                  : "Choose an image up to 5 MB."}
            </p>
          </div>
        </div>

        {/* Category name */}
        <div>
          <label htmlFor="category-name" className={labelClass}>
            Category name
          </label>

          <input
            id="category-name"
            autoFocus
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            className={inputClass}
            placeholder="e.g. Electronics"
          />
        </div>

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
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
