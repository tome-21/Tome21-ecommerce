import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

const apiEndpoint = import.meta.env.VITE_API_URL;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2";

const money = (n) => `ETB ${Number(n || 0).toLocaleString("en-US")}`;

const formatDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

const boxPath =
  "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4";

/* Status: label, badge colors, and progress step (1 to 3, 0 = cancelled) */
function getStatus(status) {
  switch ((status || "pending").toLowerCase()) {
    case "completed":
    case "delivered":
      return {
        label: "Delivered",
        badge: "bg-emerald-50 text-emerald-700",
        step: 3,
      };
    case "processing":
    case "shipped":
    case "confirmed":
      return {
        label: "Confirmed / Processing",
        badge: "bg-blue-50 text-blue-700",
        step: 2,
      };
    case "cancelled":
    case "canceled":
      return { label: "Cancelled", badge: "bg-red-50 text-red-700", step: 0 };
    default:
      return { label: "Pending", badge: "bg-amber-50 text-amber-700", step: 1 };
  }
}

const STEPS = ["Placed", "Processing", "Delivered"];

function ProgressTrack({ step }) {
  if (step === 0) return null;
  return (
    <ol className="flex items-center" aria-label="Order progress">
      {STEPS.map((label, i) => {
        const done = i + 1 <= step;
        const current = i + 1 === step;
        return (
          <li
            key={label}
            className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}
            aria-current={current ? "step" : undefined}
          >
            <div className="flex flex-col items-center">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                  done ? "bg-[#3e9d24]" : "bg-gray-200"
                }`}
              >
                {done && (
                  <Icon className="w-3.5 h-3.5">
                    <path d="M5 13l4 4L19 7" />
                  </Icon>
                )}
              </span>
              <span
                className={`mt-1 text-xs ${
                  current ? "font-semibold text-gray-900" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`flex-1 h-0.5 mx-2 mb-5 ${
                  i + 1 < step ? "bg-[#3e9d24]" : "bg-gray-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
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

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [open, setOpen] = useState({});
  const [details, setDetails] = useState({});

  const [placedId, setPlacedId] = useState(
    location.state?.placedOrderId ?? null,
  );
  const [showBanner, setShowBanner] = useState(
    Boolean(location.state?.placedOrderId),
  );

  useEffect(() => {
    if (location.state?.placedOrderId) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      setUnauthorized(false);
      try {
        const { data } = await axios.get(`${apiEndpoint}/orders`, {
          withCredentials: true,
          signal: controller.signal,
        });
        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(list);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error(err);
        if (err.response?.status === 401) setUnauthorized(true);
        else
          setError(
            "We couldn't load your orders. Check your connection and try again.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reloadKey]);

  const loadDetails = async (id) => {
    setDetails((d) => ({ ...d, [id]: { loading: true } }));
    try {
      const { data } = await axios.get(`${apiEndpoint}/orders/${id}`, {
        withCredentials: true,
      });
      setDetails((d) => ({ ...d, [id]: { data } }));
    } catch (err) {
      console.error(err);
      setDetails((d) => ({
        ...d,
        [id]: { error: "We couldn't load the details for this order." },
      }));
    }
  };

  const toggle = (id) => {
    const willOpen = !open[id];
    setOpen((o) => ({ ...o, [id]: willOpen }));
    if (willOpen && !details[id]?.data && !details[id]?.loading)
      loadDetails(id);
  };

  useEffect(() => {
    if (!placedId || orders.length === 0) return;
    if (orders.some((o) => String(o.id) === String(placedId))) {
      setOpen((o) => ({ ...o, [placedId]: true }));
      loadDetails(placedId);
    }
    setPlacedId(null);
  }, [orders]);

  if (loading) {
    return (
      <PageShell>
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 animate-pulse">
          <div className="h-8 w-40 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </main>
      </PageShell>
    );
  }

  if (unauthorized) {
    return (
      <PageShell>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 text-[#3e9d24] flex items-center justify-center mb-4">
              <Icon className="w-7 h-7">
                <path d={boxPath} />
              </Icon>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Log in to see your orders
            </h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Your orders are saved to your account.
            </p>
            <button
              type="button"
              onClick={() =>
                (window.location.href = `${apiEndpoint}/auth/google`)
              }
              className={`w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-800 px-4 py-3 rounded-lg transition-colors ${focusRing}`}
            >
              Continue with Google
            </button>
          </div>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          My orders
        </h1>
        <p className="text-sm text-gray-500 mt-0.5 mb-5">
          {orders.length > 0
            ? `${orders.length} ${orders.length === 1 ? "order" : "orders"}`
            : "Track your deliveries here."}
        </p>

        {showBanner && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 text-[#1f4d14] p-4"
          >
            <span className="shrink-0 w-8 h-8 rounded-full bg-[#3e9d24] text-white flex items-center justify-center">
              <Icon className="w-4 h-4">
                <path d="M5 13l4 4L19 7" />
              </Icon>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold">Payment Verified & Order Placed!</p>
              <p className="text-sm">
                Your payment was verified successfully. We will call you to
                confirm delivery.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              aria-label="Dismiss message"
              className={`shrink-0 w-7 h-7 rounded flex items-center justify-center hover:bg-green-100 ${focusRing}`}
            >
              <Icon className="w-4 h-4">
                <path d="M6 18L18 6M6 6l12 12" />
              </Icon>
            </button>
          </div>
        )}

        {error ? (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <p className="text-sm">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className={`self-start sm:self-auto bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 ${focusRing}`}
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 sm:p-14 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-50 text-[#3e9d24] flex items-center justify-center mb-4">
              <Icon className="w-8 h-8">
                <path d={boxPath} />
              </Icon>
            </div>
            <h2 className="text-lg font-bold text-gray-900">No orders yet</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              When you place an order, it will show up here.
            </p>
            <Link
              to="/products"
              className={`inline-block bg-[#3e9d24] text-white font-semibold px-8 py-2.5 rounded-full hover:bg-[#2f7d1b] transition-colors ${focusRing}`}
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => {
              const status = getStatus(order.status);
              const isOpen = !!open[order.id];
              const d = details[order.id];
              const panelId = `order-panel-${order.id}`;

              return (
                <li
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Summary */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="font-bold text-gray-900">
                            Order #{order.id}
                          </h2>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${status.badge}`}
                          >
                            {status.label}
                          </span>
                          {order.payment_method && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase">
                              {order.payment_method} (
                              {order.payment_status || "paid"})
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Placed on {formatDate(order.created_at)}
                          {order.payment_reference &&
                            ` • Ref: ${order.payment_reference}`}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-extrabold text-gray-900">
                          {money(order.total_amount)}
                        </p>
                      </div>
                    </div>

                    {status.step > 0 && (
                      <div className="mt-5 max-w-md">
                        <ProgressTrack step={status.step} />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggle(order.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f7d1b] hover:underline rounded ${focusRing}`}
                    >
                      {isOpen ? "Hide details" : "View details"}
                      <Icon
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </Icon>
                    </button>
                  </div>

                  {/* Details */}
                  {isOpen && (
                    <div
                      id={panelId}
                      className="border-t border-gray-100 bg-gray-50/60 p-4 sm:p-5"
                    >
                      {d?.loading && (
                        <div className="space-y-3 animate-pulse">
                          <div className="h-14 bg-gray-200 rounded-lg" />
                          <div className="h-14 bg-gray-200 rounded-lg" />
                        </div>
                      )}

                      {d?.error && (
                        <div className="flex items-center justify-between gap-3 text-sm text-red-700">
                          <span>{d.error}</span>
                          <button
                            type="button"
                            onClick={() => loadDetails(order.id)}
                            className={`font-semibold underline rounded ${focusRing}`}
                          >
                            Try again
                          </button>
                        </div>
                      )}

                      {d?.data && (
                        <div className="space-y-5">
                          <ul className="divide-y divide-gray-200">
                            {(d.data.items || []).map((item) => {
                              const line =
                                item.subtotal || item.price * item.quantity;
                              return (
                                <li
                                  key={item.id ?? item.product_id}
                                  className="flex items-center gap-3 py-3 first:pt-0"
                                >
                                  <div className="w-14 h-14 shrink-0 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center text-gray-300">
                                    {item.image_url ? (
                                      <img
                                        src={item.image_url}
                                        alt=""
                                        loading="lazy"
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <Icon className="w-6 h-6">
                                        <path d={boxPath} />
                                      </Icon>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {item.product_id ? (
                                      <Link
                                        to={`/products/${item.product_id}`}
                                        className={`font-medium text-gray-900 hover:text-[#2f7d1b] line-clamp-2 rounded ${focusRing}`}
                                      >
                                        {item.name}
                                      </Link>
                                    ) : (
                                      <p className="font-medium text-gray-900 line-clamp-2">
                                        {item.name}
                                      </p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                      {item.quantity} × {money(item.price)}
                                    </p>
                                  </div>
                                  <p className="font-bold text-gray-900 shrink-0">
                                    {money(line)}
                                  </p>
                                </li>
                              );
                            })}
                          </ul>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 text-sm">
                            <div>
                              <p className="text-gray-500">Delivery address</p>
                              <p className="font-medium text-gray-900 mt-0.5">
                                {d.data.shipping_address ||
                                  order.shipping_address}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phone</p>
                              <p className="font-medium text-gray-900 mt-0.5">
                                {d.data.shipping_phone || order.shipping_phone}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payment Reference</p>
                              <p className="font-mono font-medium text-gray-900 mt-0.5">
                                {order.payment_reference || "N/A"} (
                                {order.payment_method?.toUpperCase()})
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </PageShell>
  );
}
