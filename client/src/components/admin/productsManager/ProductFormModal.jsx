
import { useState } from "react";
import axios from "axios";

import {
  Modal,
  Spinner,
  btnGhost,
  btnPrimary,
  getErrorMessage,
  inputClass,
  labelClass,
} from "../ui";

import { API_ENDPOINT, withCreds } from "./productManagerUtils";

export default function ProductFormModal({
  product,
  categories,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price != null ? String(Number(product.price)) : "",
    stock: product?.stock != null ? String(product.stock) : "",
    condition: product?.condition ?? "new",
    category_id:
      product?.category_id != null ? String(product.category_id) : "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    const categoryId = Number(form.category_id);

    if (!name) return setError("Product name is required");

    if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      return setError("Enter a valid price");
    }

    if (form.stock.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      return setError("Stock must be a whole number, 0 or more");
    }

    if (!form.category_id || !Number.isInteger(categoryId) || categoryId <= 0) {
      return setError("Select a category");
    }

    const payload = {
      name,
      description: form.description.trim(),
      price,
      stock,
      condition: form.condition,
      category_id: categoryId,
    };

    setSaving(true);
    setError("");

    try {
      if (isEdit) {
        await axios.put(
          `${API_ENDPOINT}/products/${product.id}`,
          payload,
          withCreds,
        );
      } else {
        await axios.post(
          `${API_ENDPOINT}/products`,
          payload,
          withCreds,
        );
      }

      onSuccess(isEdit);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Error saving product"));
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
            value={form.name}
            onChange={setField("name")}
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
            onChange={setField("description")}
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
              min="0"
              step="any"
              value={form.price}
              onChange={setField("price")}
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
              min="0"
              step="1"
              value={form.stock}
              onChange={setField("stock")}
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
              onChange={setField("condition")}
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
              onChange={setField("category_id")}
              className={inputClass}
            >
              <option value="">Select…</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
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
            {saving
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
