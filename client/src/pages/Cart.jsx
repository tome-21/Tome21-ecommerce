import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartSkeleton from "../components/cart/CartSkeleton";
import CartItem from "../components/cart/CartItem";
import PaymentSection from "../components/cart/PaymentSection";
import OrderSummary from "../components/cart/OrderSummary";
import axios from "axios";

const apiEndpoint = import.meta.env.VITE_API_URL;
const ETH_PHONE = /^(?:\+251|251|0)?([79]\d{8})$/;

function validatePhone(value) {
  const v = value.trim().replace(/\s+/g, "");
  if (!v) return "Enter your phone number.";
  if (!ETH_PHONE.test(v)) return "Enter a valid number, e.g. 0911234567.";
  return "";
}

function validateAddress(value) {
  return value.trim() ? "" : "Enter your delivery address.";
}

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
  const [payment, setPayment] = useState({
    method: "telebirr",
    reference: "",
    accountSuffix: "",
  });

  const [touched, setTouched] = useState({
    phone: false,
    address: false,
    reference: false,
    accountSuffix: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
        if (err.response?.status === 401) setUnauthorized(true);
        else setLoadError("Could not load cart. Check your internet connection.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reloadKey]);

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    setBusyId(id);
    setActionError("");
    try {
      await axios.put(`${apiEndpoint}/cart/${id}`, { quantity }, { withCredentials: true });
      setItems((prev) => prev.map((it) => (it.product_id === id ? { ...it, quantity } : it)));
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not update quantity.");
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (id) => {
    setBusyId(id);
    setActionError("");
    try {
      await axios.delete(`${apiEndpoint}/cart/${id}`, { withCredentials: true });
      setItems((prev) => prev.filter((it) => it.product_id !== id));
    } catch (err) {
      setActionError("Could not remove item.");
    } finally {
      setBusyId(null);
    }
  };

  const itemCount = items.reduce((n, it) => n + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0);
  const hasStockIssue = items.some((it) => it.stock != null && it.quantity > it.stock);

  const phoneError = touched.phone ? validatePhone(shipping.phone) : "";
  const addressError = touched.address ? validateAddress(shipping.address) : "";

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setTouched({ phone: true, address: true, reference: true, accountSuffix: true });

    if (
      validatePhone(shipping.phone) ||
      validateAddress(shipping.address) ||
      !payment.reference.trim() ||
      (payment.method === "cbe" && !payment.accountSuffix.trim())
    ) return;

    if (hasStockIssue) {
      setSubmitError("Some items exceed available stock limits.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedPhone = shipping.phone.trim().replace(/\s+/g, "").replace(ETH_PHONE, "+251$1");
      const { data } = await axios.post(
        `${apiEndpoint}/orders`,
        {
          shipping_address: shipping.address.trim(),
          shipping_phone: formattedPhone,
          payment_method: payment.method,
          reference: payment.reference.trim(),
          account_suffix: payment.method === "cbe" ? payment.accountSuffix.trim() : undefined,
        },
        { withCredentials: true }
      );
      setItems([]);
      navigate("/orders", { state: { placedOrderId: data?.order?.id || data?.id } });
    } catch (err) {
      setSubmitError(err.response?.data?.error || err.response?.data?.message || "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CartSkeleton />;

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs text-center max-w-sm w-full">
            <h1 className="text-xl font-bold mb-2">Log in required</h1>
            <p className="text-xs text-gray-500 mb-6">Log in to review and check out your saved items.</p>
            <button
              onClick={() => (window.location.href = `${apiEndpoint}/auth/google`)}
              className="w-full bg-[#3e9d24] text-white font-bold py-3 rounded-xl hover:bg-[#2f7d1b] transition-colors"
            >
              Continue with Google
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs text-center max-w-sm w-full">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-xs text-gray-500 mb-6">Browse our store and pick out your favorites.</p>
            <Link
              to="/products"
              className="inline-block w-full bg-[#3e9d24] text-white font-bold py-3 rounded-xl hover:bg-[#2f7d1b] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Shopping Cart <span className="text-sm font-normal text-gray-500">({itemCount} items)</span>
          </h1>
          <Link to="/products" className="text-xs font-bold text-[#2f7d1b] hover:underline">
            Back to store
          </Link>
        </div>

        {actionError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-xl">
            {actionError}
          </div>
        )}

        <form id="checkout-form" onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6">
          <div className="space-y-6">
            {/* Cart Items List */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100">
              {items.map((it) => (
                <CartItem
                  key={it.product_id}
                  item={it}
                  busy={busyId === it.product_id}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </section>

            {/* Delivery Inputs */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => setShipping((prev) => ({ ...prev, phone: e.target.value }))}
                    onBlur={(e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }))}
                    placeholder="0911234567"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 ${
                      phoneError ? "border-red-400 focus:ring-red-400/20" : "border-gray-200 focus:ring-[#3e9d24]/20 focus:border-[#3e9d24]"
                    }`}
                  />
                  {phoneError && <p className="text-xs font-semibold text-red-500 mt-1">{phoneError}</p>}
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs font-semibold text-gray-700 mb-1">
                    Delivery address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={shipping.address}
                    onChange={(e) => setShipping((prev) => ({ ...prev, address: e.target.value }))}
                    onBlur={(e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }))}
                    placeholder="e.g. Bole, near Edna Mall"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 ${
                      addressError ? "border-red-400 focus:ring-red-400/20" : "border-gray-200 focus:ring-[#3e9d24]/20 focus:border-[#3e9d24]"
                    }`}
                  />
                  {addressError && <p className="text-xs font-semibold text-red-500 mt-1">{addressError}</p>}
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <PaymentSection
              total={subtotal}
              payment={payment}
              touched={touched}
              setPayment={setPayment}
              onChange={(e) => setPayment((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
              onBlur={(e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }))}
            />
          </div>

          {/* Order Summary */}
          <OrderSummary
            subtotal={subtotal}
            total={subtotal}
            itemCount={itemCount}
            submitting={submitting}
            hasStockIssue={hasStockIssue}
            submitError={submitError}
          />
        </form>
      </main>
      <Footer />

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 p-4 flex items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-xs text-gray-500">Total Price</p>
          <p className="text-lg font-black text-[#2f7d1b]">ETB {subtotal.toLocaleString("en-US")}</p>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={submitting || hasStockIssue}
          className="bg-[#3e9d24] text-white font-bold px-6 py-3 rounded-xl shadow-xs disabled:opacity-50"
        >
          {submitting ? "Placing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}