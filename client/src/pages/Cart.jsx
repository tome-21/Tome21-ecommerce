import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

const apiEndpoint = import.meta.env.VITE_API_URL;

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Inline Checkout Form States
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    city: "Addis Ababa",
    location: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("telebirr");

  // Fetch Cart Items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`${apiEndpoint}/cart`, {
          withCredentials: true,
        });
        setCartItems(data.items || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          setError("Please log in to view your shopping cart.");
        } else {
          setError("Could not load your cart. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  // Update Quantity Handler
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setActionLoading(id);
      await axios.put(
        `${apiEndpoint}/cart/${id}`,
        { quantity: newQuantity },
        { withCredentials: true },
      );

      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === id ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } catch (err) {
      console.error("Failed to update quantity on server", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Remove Item Handler
  const removeItem = async (id) => {
    try {
      setActionLoading(id);
      await axios.delete(`${apiEndpoint}/cart/${id}`, {
        withCredentials: true,
      });
      setCartItems((prev) => prev.filter((item) => item.product_id !== id));
    } catch (err) {
      console.error("Failed to remove item", err);
    } finally {
      setActionLoading(null);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const deliveryFee = subtotal > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  // Handle Direct Order Placement from Cart
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!shipping.fullName || !shipping.phone || !shipping.location) {
      setError(
        "Please fill in all shipping details before placing your order.",
      );
      return;
    }

    try {
      setSubmittingOrder(true);

      const orderPayload = {
        shipping_address: shipping,
        payment_method: paymentMethod,
        items: cartItems,
        total_amount: total,
      };

      const response = await axios.post(`${apiEndpoint}/orders`, orderPayload, {
        withCredentials: true,
      });

      const orderId = response.data?.orderId || response.data?.id;
      navigate(orderId ? `/order-success/${orderId}` : "/orders");
    } catch (err) {
      console.error("Order submission failed", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl" />
            <div className="h-80 bg-gray-200 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-sm text-gray-500 mb-6">
            Sign in with your account to access your saved items.
          </p>
          <Link
            to="/"
            className="bg-[#3e9d24] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#34881e] transition-all shadow-md active:scale-95"
          >
            Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 antialiased">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Shopping Cart & Checkout
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items in
            your cart
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold text-lg">
              &times;
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-50 text-[#3e9d24] rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Your cart is empty
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              Looks like you haven't added anything to your cart yet. Discover
              our top deals!
            </p>
            <Link
              to="/"
              className="bg-[#3e9d24] hover:bg-[#34881e] text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 text-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start"
          >
            {/* Left: Cart Items & Shipping Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items List */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                <div className="px-6 py-4 bg-gray-50/50 font-bold text-xs uppercase tracking-wider text-gray-500">
                  Review Cart Items
                </div>
                {cartItems.map((item) => (
                  <div
                    key={item.product_id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center"
                  >
                    <div className="w-full sm:w-20 h-20 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-2 flex items-center justify-center">
                      <img
                        src={
                          item.image_url ||
                          "https://placehold.co/200?text=No+Image"
                        }
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 ||
                              actionLoading === item.product_id
                            }
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.stock ||
                              actionLoading === item.product_id
                            }
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id)}
                          disabled={actionLoading === item.product_id}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right sm:self-center w-full sm:w-auto">
                      <span className="text-base font-black text-gray-900">
                        ETB{" "}
                        {(Number(item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Shipping Address Form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                  📍 Delivery Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={shipping.fullName}
                      onChange={handleShippingChange}
                      placeholder="e.g., Abebe Kebede"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#3e9d24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={shipping.phone}
                      onChange={handleShippingChange}
                      placeholder="+251 91..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#3e9d24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      City *
                    </label>
                    <select
                      name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#3e9d24]"
                    >
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Adama">Adama</option>
                      <option value="Hawassa">Hawassa</option>
                      <option value="Bahir Dar">Bahir Dar</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Specific Location / Sub-city *
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={shipping.location}
                      onChange={handleShippingChange}
                      placeholder="e.g., Bole, around Edna Mall"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#3e9d24]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Method & Order Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
                Payment & Summary
              </h2>

              {/* Payment Selectors */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("telebirr")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all ${
                      paymentMethod === "telebirr"
                        ? "border-[#3e9d24] bg-green-50 text-[#3e9d24]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Telebirr
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cbe")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all ${
                      paymentMethod === "cbe"
                        ? "border-[#3e9d24] bg-green-50 text-[#3e9d24]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#3e9d24] bg-green-50 text-[#3e9d24]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    COD
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm pt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ETB {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">
                    ETB {deliveryFee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">Total</span>
                  <span className="text-xs text-gray-400">VAT included</span>
                </div>
                <span className="text-2xl font-black text-[#3e9d24]">
                  ETB {total.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingOrder || cartItems.length === 0}
                className="w-full bg-[#3e9d24] hover:bg-[#34881e] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 text-base"
              >
                {submittingOrder ? "Processing..." : "Place Order Now"}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
