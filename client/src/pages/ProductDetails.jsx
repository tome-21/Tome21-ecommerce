import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

const apiEndpoint = import.meta.env.VITE_API_URL;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d2e] focus-visible:ring-offset-2";

const CONDITION_LABELS = { new: "Brand new", used: "Used or refurbished" };

const formatPrice = (value) => {
  const n = Number(value);
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(n)
  ) {
    return value ?? "";
  }
  return n.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const Icon = ({ children, className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CartIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </Icon>
);

/* ------------------------------------------------------------------ */
/* Gallery: main image with hover zoom, arrows and thumbnails          */
/* ------------------------------------------------------------------ */
function Gallery({ images, name }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => setIndex(0), [images]);

  const count = images.length;
  const go = (i) => setIndex((i + count) % count);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div>
      <div
        className="relative aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden"
        onPointerEnter={(e) => e.pointerType === "mouse" && setZoom(true)}
        onPointerLeave={() => setZoom(false)}
        onPointerMove={onMove}
      >
        {count === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <Icon className="w-16 h-16">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </Icon>
            <span className="text-sm text-gray-400">No photo yet</span>
          </div>
        ) : (
          <img
            src={images[index]}
            alt={`${name}, photo ${index + 1} of ${count}`}
            className={`w-full h-full object-contain transition-transform duration-150 ${
              zoom ? "scale-[2] cursor-zoom-in" : ""
            }`}
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
          />
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white ${focusRing}`}
            >
              <Icon>
                <path d="M15 5l-7 7 7 7" />
              </Icon>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white ${focusRing}`}
            >
              <Icon>
                <path d="M9 5l7 7-7 7" />
              </Icon>
            </button>
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div
          className="flex gap-2 mt-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-white border-2 transition-colors ${focusRing} ${
                i === index
                  ? "border-[#e11d2e]"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { notFound, message }
  const [reloadKey, setReloadKey] = useState(0);

  const [busy, setBusy] = useState(null); // "add" | "buy" | null
  const [cartError, setCartError] = useState("");
  const [addedQty, setAddedQty] = useState(0);

  /* Load product */
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      setCartError("");
      setAddedQty(0);
      setQuantity(1);
      try {
        const { data } = await axios.get(`${apiEndpoint}/products/${id}`, {
          signal: controller.signal,
        });
        setProduct(data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error(err);
        setProduct(null);
        setError(
          err.response?.status === 404
            ? { notFound: true, message: "Product not found" }
            : { notFound: false, message: "We couldn't load this product." },
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id, reloadKey]);

  /* Page title */
  useEffect(() => {
    if (product?.name) document.title = `${product.name} | Tome21`;
  }, [product]);

  /* More from the same category (skipped if the product has no category_id) */
  useEffect(() => {
    setRelated([]);
    if (!product?.category_id) return;
    const controller = new AbortController();
    axios
      .get(`${apiEndpoint}/products`, {
        params: { categoryId: product.category_id, sortBy: "newest" },
        signal: controller.signal,
      })
      .then(({ data }) =>
        setRelated(
          data.filter((p) => String(p.id) !== String(product.id)).slice(0, 4),
        ),
      )
      .catch((err) => {
        if (!axios.isCancel(err)) console.error(err);
      });
    return () => controller.abort();
  }, [product]);

  const stock = Number(product?.stock);
  const hasStock = product?.stock !== undefined && product?.stock !== null;
  const outOfStock = hasStock && stock < 1;
  const lowStock = hasStock && stock > 0 && stock <= 5;
  const maxQty = hasStock ? Math.max(1, stock) : 99;

  const addToCart = async ({ thenCheckout = false } = {}) => {
    if (!product || outOfStock || busy) return;
    setBusy(thenCheckout ? "buy" : "add");
    setCartError("");
    setAddedQty(0);
    try {
      await axios.post(
        `${apiEndpoint}/cart`,
        { product_id: product.id, quantity },
        { withCredentials: true },
      );
      if (thenCheckout) {
        navigate("/checkout");
      } else {
        setAddedQty(quantity);
      }
    } catch (err) {
      console.error(err);
      setCartError(
        err.response?.status === 401
          ? "Please log in to add items to your cart."
          : err.response?.data?.message ||
              "Could not add this product to your cart.",
      );
    } finally {
      setBusy(null);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <PageShell>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 animate-pulse">
          <div className="h-4 w-56 bg-gray-200 rounded mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-8 w-40 bg-gray-200 rounded" />
              <div className="h-12 w-full bg-gray-200 rounded-lg" />
              <div className="h-12 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        </main>
      </PageShell>
    );
  }

  /* ---------- Error / not found ---------- */
  if (error || !product) {
    return (
      <PageShell>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {error?.message || "Product not found"}
          </h1>
          <p className="text-gray-500 mt-2 max-w-md">
            {error?.notFound === false
              ? "Check your connection and try again."
              : "It may have been removed or is no longer available."}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {error?.notFound === false && (
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className={`bg-[#e11d2e] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#b5121f] ${focusRing}`}
              >
                Try again
              </button>
            )}
            <Link
              to="/products"
              className={`border border-gray-300 bg-white text-gray-800 font-semibold px-6 py-2.5 rounded-full hover:bg-gray-50 ${focusRing}`}
            >
              Browse products
            </Link>
          </div>
        </main>
      </PageShell>
    );
  }

  const images = (product.images || []).map((i) => i.image_url).filter(Boolean);
  const categoryLink = product.category_id
    ? `/products?category=${product.category_id}`
    : "/products";
  const conditionLabel = product.condition
    ? CONDITION_LABELS[product.condition] || product.condition
    : null;

  return (
    <PageShell>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 sm:py-6 pb-24 lg:pb-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500">
          <ol className="flex items-center gap-2 min-w-0">
            <li className="shrink-0">
              <Link to="/" className="hover:text-[#e11d2e] hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="shrink-0">
              <Link
                to={categoryLink}
                className="hover:text-[#e11d2e] hover:underline"
              >
                {product.category_name || "Products"}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li
              className="truncate text-gray-800 font-medium"
              aria-current="page"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          <Gallery images={images} name={product.name} />

          {/* Buy panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            {product.category_name && (
              <Link
                to={categoryLink}
                className="text-sm font-medium text-[#e11d2e] hover:underline"
              >
                {product.category_name}
              </Link>
            )}

            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl font-extrabold text-[#e11d2e]">
              <span className="text-lg font-semibold mr-1.5">ETB</span>
              {formatPrice(product.price)}
            </p>

            {/* Availability */}
            <p
              className={`mt-3 text-sm font-semibold ${
                outOfStock
                  ? "text-red-600"
                  : lowStock
                    ? "text-amber-600"
                    : "text-gray-700"
              }`}
            >
              {outOfStock
                ? "Out of stock"
                : lowStock
                  ? `Only ${stock} left in stock`
                  : "In stock"}
            </p>

            {/* Quantity */}
            {!outOfStock && (
              <div className="mt-5 flex items-center gap-4">
                <span
                  id="qty-label"
                  className="text-sm font-medium text-gray-700"
                >
                  Quantity
                </span>
                <div
                  role="group"
                  aria-labelledby="qty-label"
                  className="flex items-center border border-gray-300 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className={`w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-transparent ${focusRing}`}
                  >
                    <Icon className="w-4 h-4">
                      <path d="M5 12h14" />
                    </Icon>
                  </button>
                  <span
                    className="w-12 text-center font-semibold text-gray-900"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    aria-label="Increase quantity"
                    className={`w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-transparent ${focusRing}`}
                  >
                    <Icon className="w-4 h-4">
                      <path d="M12 5v14M5 12h14" />
                    </Icon>
                  </button>
                </div>
              </div>
            )}

            {/* Feedback */}
            {cartError && (
              <p
                role="alert"
                className="mt-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              >
                {cartError}
              </p>
            )}
            {addedQty > 0 && (
              <div
                role="status"
                className="mt-4 flex items-center justify-between gap-3 text-sm bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-2"
              >
                <span className="font-medium">
                  Added {addedQty} to your cart
                </span>
                <Link
                  to="/cart"
                  className="font-bold text-[#e11d2e] underline whitespace-nowrap"
                >
                  View cart
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => addToCart()}
                disabled={outOfStock || !!busy}
                className={`flex items-center justify-center gap-2 rounded-lg py-3 font-bold transition-colors ${focusRing} ${
                  outOfStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#e11d2e] text-white hover:bg-[#b5121f] disabled:opacity-60"
                }`}
              >
                <CartIcon />
                {outOfStock
                  ? "Out of stock"
                  : busy === "add"
                    ? "Adding…"
                    : "Add to cart"}
              </button>
            </div>

            {/* Reassurance */}
            <ul className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-700 shrink-0">
                  <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
                </Icon>
                Delivered to you
              </li>
              <li className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-700 shrink-0">
                  <path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3zm-3 9l2 2 4-4" />
                </Icon>
                Secure checkout
              </li>
            </ul>
          </div>
        </div>

        {/* Details */}
        <section className="mt-6 bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Product details
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 mb-5 border-b border-gray-100">
            {conditionLabel && (
              <div>
                <dt className="text-sm text-gray-500">Condition</dt>
                <dd className="font-semibold text-gray-900">
                  {conditionLabel}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500">Category</dt>
              <dd className="font-semibold text-gray-900">
                {product.category_name || "General"}
              </dd>
            </div>
            {hasStock && (
              <div>
                <dt className="text-sm text-gray-500">Availability</dt>
                <dd className="font-semibold text-gray-900">
                  {outOfStock ? "Out of stock" : `${stock} in stock`}
                </dd>
              </div>
            )}
          </dl>

          <h3 className="font-bold text-gray-900 mb-2">About this item</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line max-w-3xl">
            {product.description || "No description has been added yet."}
          </p>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              More in {product.category_name || "this category"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky buy bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 pt-3 flex items-center gap-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Price</p>
          <p className="font-extrabold text-[#e11d2e] leading-tight truncate">
            ETB {formatPrice(product.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => addToCart()}
          disabled={outOfStock || !!busy}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 font-bold ${focusRing} ${
            outOfStock
              ? "bg-gray-100 text-gray-400"
              : "bg-[#e11d2e] text-white active:bg-[#b5121f] disabled:opacity-60"
          }`}
        >
          <CartIcon />
          {outOfStock
            ? "Out of stock"
            : busy === "add"
              ? "Adding…"
              : "Add to cart"}
        </button>
      </div>
    </PageShell>
  );
}
