import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

const apiEndpoint = import.meta.env.VITE_API_URL;

const DELIVERY_FEE = 500; // flat fee in ETB, applied when the cart is not empty

// Ethiopian mobile numbers: 09..., 07..., +2519..., +2517...
const ETH_PHONE = /^(?:\+251|251|0)?([79]\d{8})$/;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d2e] focus-visible:ring-offset-2";

const money = (n) => Number(n).toLocaleString("en-US");

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

const cartPath =
  "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z";

function PageShell({ children, withBar = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Header />
      {children}
      <Footer />
      {withBar && <div className="lg:hidden h-20" aria-hidden="true" />}
    </div>
  );
}

function validatePhone(value) {
  const v = value.trim().replace(/\s+/g, "");
  if (!v) return "Enter your phone number.";
  if (!ETH_PHONE.test(v)) return "Enter a valid number, like 0911 234 567.";
  return "";
}

function validateAddress(value) {
  return value.trim() ? "" : "Enter your delivery address.";
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Cart() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const [shipping, setShipping] = useState({ phone: "", address: "" });
  const [touched, setTouched] = useState({ phone: false, address: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* Load cart */
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setLoadError("");
      setUnauthorized(false);
      try {
        const { data } = await axios.get(`${apiEndpoint}/cart`, {
          withCredentials: true,
          signal: controller.signal,
        });
        setItems(data.items || []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error(err);
        if (err.response?.status === 401) setUnauthorized(true);
        else
          setLoadError(
            "We couldn't load your cart. Check your connection and try again.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reloadKey]);

  const handleGoogleLogin = () => {
    window.location.href = `${apiEndpoint}/auth/google`;
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    setBusyId(id);
    setActionError("");
    try {
      await axios.put(
        `${apiEndpoint}/cart/${id}`,
        { quantity },
        { withCredentials: true },
      );
      setItems((prev) =>
        prev.map((it) => (it.product_id === id ? { ...it, quantity } : it)),
      );
    } catch (err) {
      console.error(err);
      setActionError(
        err.response?.data?.message ||
          "We couldn't update the quantity. Please try again.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (id) => {
    setBusyId(id);
    setActionError("");
    try {
      await axios.delete(`${apiEndpoint}/cart/${id}`, {
        withCredentials: true,
      });
      setItems((prev) => prev.filter((it) => it.product_id !== id));
    } catch (err) {
      console.error(err);
      setActionError("We couldn't remove this item. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const itemCount = items.reduce((n, it) => n + it.quantity, 0);
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price) * it.quantity,
    0,
  );
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const hasStockIssue = items.some(
    (it) =>
      it.stock !== undefined && it.stock !== null && it.quantity > it.stock,
  );

  const phoneError = touched.phone ? validatePhone(shipping.phone) : "";
  const addressError = touched.address ? validateAddress(shipping.address) : "";

  const onShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };
  const onShippingBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setTouched({ phone: true, address: true });

    const pErr = validatePhone(shipping.phone);
    const aErr = validateAddress(shipping.address);
    if (pErr || aErr) {
      document.getElementById(pErr ? "phone" : "address")?.focus();
      return;
    }
    if (hasStockIssue) {
      setSubmitError(
        "Some items are no longer available in the quantity you chose. Update them and try again.",
      );
      return;
    }

    const cleaned = shipping.phone.trim().replace(/\s+/g, "");
    const formattedPhone = cleaned.replace(ETH_PHONE, "+251$1");

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${apiEndpoint}/orders`,
        {
          shipping_address: shipping.address.trim(),
          shipping_phone: formattedPhone,
        },
        { withCredentials: true },
      );
      const orderId = data?.id || data?.orderId;
      setItems([]); // the backend clears the cart
      navigate("/orders", { state: { placedOrderId: orderId } });
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "We couldn't place your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <PageShell>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6">
            <div className="space-y-4">
              <div className="h-40 bg-gray-200 rounded-xl" />
              <div className="h-40 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-72 bg-gray-200 rounded-xl" />
          </div>
        </main>
      </PageShell>
    );
  }

  /* ---------- Logged out ---------- */
  if (unauthorized) {
    return (
      <PageShell>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 text-[#e11d2e] flex items-center justify-center mb-4">
              <Icon className="w-7 h-7">
                <path d={cartPath} />
              </Icon>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Log in to see your cart
            </h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Your cart is saved to your account so you can check out any time.
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-800 px-4 py-3 rounded-lg transition-colors ${focusRing}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </main>
      </PageShell>
    );
  }

  /* ---------- Load error ---------- */
  if (loadError) {
    return (
      <PageShell>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-gray-900">Cart unavailable</h1>
          <p className="text-gray-500 mt-2 max-w-sm">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className={`mt-6 bg-[#e11d2e] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#b5121f] ${focusRing}`}
          >
            Try again
          </button>
        </main>
      </PageShell>
    );
  }

  /* ---------- Empty ---------- */
  if (items.length === 0) {
    return (
      <PageShell>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 text-[#e11d2e] flex items-center justify-center mb-4">
              <Icon className="w-8 h-8">
                <path d={cartPath} />
              </Icon>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Your cart is empty
            </h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Browse our products and add something you like.
            </p>
            <Link
              to="/products"
              className={`inline-block bg-[#e11d2e] text-white font-semibold px-8 py-2.5 rounded-full hover:bg-[#b5121f] transition-colors ${focusRing}`}
            >
              Start shopping
            </Link>
          </div>
        </main>
      </PageShell>
    );
  }

  const inputClass = (hasError) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-[#e11d2e] focus:ring-[#e11d2e]"
    }`;

  const placeOrderLabel = submitting ? "Placing order…" : "Place order";

  /* ---------- Cart + checkout ---------- */
  return (
    <PageShell withBar>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4 sm:py-6">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Shopping cart
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <Link
            to="/products"
            className={`text-sm font-semibold text-[#e11d2e] hover:underline rounded ${focusRing}`}
          >
            Continue shopping
          </Link>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3"
          >
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError("")}
              aria-label="Dismiss message"
              className={`shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 ${focusRing}`}
            >
              <Icon className="w-4 h-4">
                <path d="M6 18L18 6M6 6l12 12" />
              </Icon>
            </button>
          </div>
        )}

        <form
          id="checkout-form"
          onSubmit={handlePlaceOrder}
          noValidate
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start"
        >
          {/* Left column */}
          <div className="space-y-6 min-w-0">
            {/* Items */}
            <section
              aria-label="Items in your cart"
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <ul className="divide-y divide-gray-100">
                {items.map((it) => {
                  const busy = busyId === it.product_id;
                  const hasStock = it.stock !== undefined && it.stock !== null;
                  const overStock = hasStock && it.quantity > it.stock;
                  const atMax = hasStock && it.quantity >= it.stock;
                  return (
                    <li
                      key={it.product_id}
                      className={`flex gap-4 p-4 sm:p-5 transition-opacity ${
                        busy ? "opacity-60" : ""
                      }`}
                    >
                      <Link
                        to={`/products/${it.product_id}`}
                        className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center ${focusRing}`}
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Icon className="w-8 h-8 text-gray-300">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </Icon>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/products/${it.product_id}`}
                            className={`font-medium text-gray-900 hover:text-[#e11d2e] line-clamp-2 rounded ${focusRing}`}
                          >
                            {it.name}
                          </Link>
                          <p className="font-bold text-gray-900 shrink-0">
                            ETB {money(Number(it.price) * it.quantity)}
                          </p>
                        </div>

                        <p className="text-sm text-gray-500 mt-0.5">
                          ETB {money(it.price)} each
                        </p>

                        {overStock && (
                          <p className="text-sm font-medium text-red-600 mt-1">
                            {it.stock > 0
                              ? `Only ${it.stock} available. Lower the quantity to continue.`
                              : "This item is out of stock. Remove it to continue."}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-4">
                          <div
                            role="group"
                            aria-label={`Quantity for ${it.name}`}
                            className="flex items-center border border-gray-300 rounded-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(it.product_id, it.quantity - 1)
                              }
                              disabled={it.quantity <= 1 || busy}
                              aria-label="Decrease quantity"
                              className={`w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-transparent ${focusRing}`}
                            >
                              <Icon className="w-4 h-4">
                                <path d="M5 12h14" />
                              </Icon>
                            </button>
                            <span
                              className="w-9 text-center text-sm font-semibold"
                              aria-live="polite"
                            >
                              {it.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(it.product_id, it.quantity + 1)
                              }
                              disabled={atMax || busy}
                              aria-label="Increase quantity"
                              className={`w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-transparent ${focusRing}`}
                            >
                              <Icon className="w-4 h-4">
                                <path d="M12 5v14M5 12h14" />
                              </Icon>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(it.product_id)}
                            disabled={busy}
                            className={`text-sm font-medium text-gray-500 hover:text-[#e11d2e] hover:underline rounded disabled:opacity-50 ${focusRing}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Delivery */}
            <section
              aria-labelledby="delivery-heading"
              className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6"
            >
              <h2
                id="delivery-heading"
                className="text-lg font-bold text-gray-900 mb-4"
              >
                Delivery details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={shipping.phone}
                    onChange={onShippingChange}
                    onBlur={onShippingBlur}
                    placeholder="0911 234 567"
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                    className={inputClass(!!phoneError)}
                  />
                  {phoneError && (
                    <p id="phone-error" className="text-xs text-red-600 mt-1">
                      {phoneError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Delivery address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    value={shipping.address}
                    onChange={onShippingChange}
                    onBlur={onShippingBlur}
                    placeholder="Area, street, landmark (e.g. Bole, near Edna Mall)"
                    aria-invalid={!!addressError}
                    aria-describedby={
                      addressError ? "address-error" : undefined
                    }
                    className={inputClass(!!addressError)}
                  />
                  {addressError && (
                    <p id="address-error" className="text-xs text-red-600 mt-1">
                      {addressError}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Order summary */}
          <aside
            aria-labelledby="summary-heading"
            className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 lg:sticky lg:top-24"
          >
            <h2
              id="summary-heading"
              className="text-lg font-bold text-gray-900 mb-4"
            >
              Order summary
            </h2>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Items ({itemCount})</dt>
                <dd className="font-medium text-gray-900">
                  ETB {money(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Delivery</dt>
                <dd className="font-medium text-gray-900">
                  ETB {money(deliveryFee)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-baseline justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-[#e11d2e]">
                ETB {money(total)}
              </span>
            </div>

            {submitError && (
              <p
                role="alert"
                className="mt-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              >
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || hasStockIssue}
              className={`hidden lg:block mt-5 w-full bg-[#e11d2e] text-white font-bold py-3 rounded-lg hover:bg-[#b5121f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
            >
              {placeOrderLabel}
            </button>

            <p className="hidden lg:block mt-3 text-xs text-gray-500 text-center">
              We will use your phone number to confirm delivery.
            </p>
          </aside>
        </form>
      </main>

      {/* Mobile sticky checkout bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 pt-3 flex items-center gap-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-extrabold text-[#e11d2e] leading-tight truncate">
            ETB {money(total)}
          </p>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={submitting || hasStockIssue}
          className={`flex-1 bg-[#e11d2e] text-white font-bold py-3 rounded-lg active:bg-[#b5121f] disabled:opacity-50 ${focusRing}`}
        >
          {placeOrderLabel}
        </button>
      </div>
    </PageShell>
  );
}
