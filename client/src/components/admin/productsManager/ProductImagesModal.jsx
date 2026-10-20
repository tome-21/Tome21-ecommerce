import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { Modal, Spinner, btnPrimary, getErrorMessage, inputClass } from "../ui";

import {
  API_ENDPOINT,
  isValidImage,
  sortImages,
  withCreds,
} from "./productManagerUtils";

function Thumb({ url, name = "Product image" }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border bg-slate-100 text-xs text-slate-400"
        aria-label="Image unavailable"
      >
        No image
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
    />
  );
}

export default function ProductImagesModal({ product, onClose, onChanged }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // Load all images for this product.
  useEffect(() => {
    const controller = new AbortController();

    async function loadImages() {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(
          `${API_ENDPOINT}/product-images/product/${product.id}`,
          { ...withCreds, signal: controller.signal },
        );

        setImages(sortImages(Array.isArray(data) ? data : []));
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError(
            getErrorMessage(requestError, "Failed to load product images"),
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadImages();

    return () => controller.abort();
  }, [product.id]);

  // Create and clean up the local preview URL.
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isValidImage(file)) {
      setError(
        !file.type.startsWith("image/")
          ? "Please select an image file"
          : "Image must be 5 MB or smaller",
      );
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  // Upload a new image.
  const handleAdd = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose an image first");
      return;
    }

    setAdding(true);
    setError("");

    const nextOrder = images.length
      ? Math.max(...images.map((image) => Number(image.sort_order) || 0)) + 1
      : 0;

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("sort_order", String(nextOrder));

    try {
      const { data } = await axios.post(
        `${API_ENDPOINT}/product-images/product/${product.id}`,
        formData,
        withCreds,
      );

      // Backend responds with { message, data: image }.
      setImages((current) => sortImages([...current, data.data]));

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onChanged();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to upload image"));
    } finally {
      setAdding(false);
    }
  };

  // Delete the database record and its Cloudinary image.
  const handleDelete = async (image) => {
    setBusyId(image.id);
    setError("");

    try {
      const { data } = await axios.delete(
        `${API_ENDPOINT}/product-images/${image.id}`,
        withCreds,
      );

      setImages((current) =>
        current.filter((item) => String(item.id) !== String(image.id)),
      );

      setConfirmId(null);
      onChanged();

      if (data.imageCleanupFailed) {
        setError(
          "Image record deleted, but Cloudinary cleanup failed. Check the server logs.",
        );
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to delete image"));
    } finally {
      setBusyId(null);
    }
  };

  // Swap an image with its neighbour and persist the new order.
  const moveImage = async (index, direction) => {
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= images.length ||
      reordering ||
      busyId !== null
    ) {
      return;
    }

    const previous = images;
    const reordered = [...images];

    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];

    const next = reordered.map((image, position) => ({
      ...image,
      sort_order: position,
    }));

    const oldOrder = new Map(
      previous.map((image) => [String(image.id), Number(image.sort_order)]),
    );

    const changed = next.filter(
      (image) => oldOrder.get(String(image.id)) !== image.sort_order,
    );

    setImages(next);
    setReordering(true);
    setError("");

    try {
      await Promise.all(
        changed.map((image) =>
          axios.put(
            `${API_ENDPOINT}/product-images/${image.id}`,
            { sort_order: image.sort_order },
            withCreds,
          ),
        ),
      );

      onChanged();
    } catch (requestError) {
      setImages(previous);
      setError(getErrorMessage(requestError, "Failed to reorder images"));
    } finally {
      setReordering(false);
    }
  };

  const iconButton =
    "flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <Modal
      title={`Images · ${product.name}`}
      onClose={onClose}
      busy={adding}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 p-6">
        <form onSubmit={handleAdd} className="space-y-3">
          <label
            htmlFor="product-image-file"
            className="block text-sm font-medium text-slate-700"
          >
            Add an image
          </label>

          <input
            ref={fileInputRef}
            id="product-image-file"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={inputClass}
          />

          {previewUrl && (
            <div className="flex items-center gap-3">
              <img
                src={previewUrl}
                alt="Selected image preview"
                className="h-16 w-16 rounded-lg border object-cover"
              />
              <p className="min-w-0 truncate text-sm text-slate-500">
                {selectedFile?.name}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={adding || !selectedFile}
            className={btnPrimary}
          >
            {adding && <Spinner />}
            {adding ? "Uploading…" : "Upload image"}
          </button>
        </form>

        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}

        <p className="text-xs text-slate-500">
          The first image is the main photo. Images must be 5 MB or smaller.
        </p>

        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Loading images…
            </p>
          ) : images.length === 0 ? (
            <p className="rounded-lg border-2 border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
              No images yet. Upload your first one above.
            </p>
          ) : (
            images.map((image, index) => (
              <div
                key={image.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2"
              >
                <Thumb url={image.image_url} />

                <div className="min-w-0 flex-1">
                  {index === 0 && (
                    <span className="mb-1 inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700">
                      Main
                    </span>
                  )}

                  <p
                    className="truncate text-xs text-slate-500"
                    title={image.image_url}
                  >
                    {image.image_url}
                  </p>
                </div>

                {confirmId === image.id ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(image)}
                      disabled={busyId === image.id}
                      className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {busyId === image.id ? "…" : "Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      disabled={busyId === image.id}
                      className="rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0 || reordering || busyId !== null}
                      aria-label="Move image up"
                      className={iconButton}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={
                        index === images.length - 1 ||
                        reordering ||
                        busyId !== null
                      }
                      aria-label="Move image down"
                      className={iconButton}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmId(image.id)}
                      disabled={busyId !== null || reordering}
                      aria-label="Delete image"
                      className="flex h-8 w-8 items-center justify-center rounded text-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30"
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
