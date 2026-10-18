import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const apiEndpoint = import.meta.env.VITE_API_URL;

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(`${apiEndpoint}/products/${id}`);

        setProduct(data);
        setActiveImage(data.images?.[0]?.image_url || "");
        setQuantity(1);
      } catch (err) {
        console.error(err);
        setError("Could not load this product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const images = product?.images?.length
    ? product.images.map((image) => image.image_url)
    : ["https://placehold.co/800x600?text=No+Image"];

  const addToCart = async () => {
    if (!product || product.stock < 1) return;

    try {
      setAddingToCart(true);
      setMessage("");

      await axios.post(
        `${apiEndpoint}/cart`,
        {
          product_id: product.id,
          quantity,
        },
        { withCredentials: true },
      );

      setMessage("Product added to cart!");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.status === 401
          ? "Please log in to add items to your cart."
          : err.response?.data?.message || "Could not add product to cart.",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  /* Loading Skeleton State */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 animate-pulse space-y-6">
          <div className="h-4 w-48 bg-gray-200 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-[420px] bg-gray-200 rounded-2xl" />
              <div className="h-32 bg-gray-200 rounded-2xl" />
            </div>
            <div className="h-[420px] bg-gray-200 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* Error / Not Found State */
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {error || "Product not found"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The item you are looking for might have been moved or deleted.
          </p>
          <Link
            to="/products"
            className="bg-[#3e9d24] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#34881e] transition-all shadow-md active:scale-95"
          >
            Explore Products
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
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 font-medium">
          <Link to="/" className="hover:text-[#3e9d24] transition-colors">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            to="/products"
            className="hover:text-[#3e9d24] transition-colors"
          >
            {product.category_name || "Products"}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Left Section: Gallery & Description */}
          <section className="md:col-span-2 space-y-6">
            {/* Gallery Box */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="relative h-80 sm:h-[420px] w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center group">
                <img
                  src={activeImage || images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 ease-out"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                  {images.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      onClick={() => setActiveImage(url)}
                      className={`relative w-20 h-20 shrink-0 rounded-xl border-2 overflow-hidden bg-gray-50 transition-all ${
                        activeImage === url
                          ? "border-[#3e9d24] ring-2 ring-[#3e9d24]/20 scale-95"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Specs Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {product.description || "No description provided."}
                </p>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-500 font-medium">Category</span>
                    <span className="font-semibold text-gray-800">
                      {product.category_name || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-500 font-medium">Condition</span>
                    <span className="font-semibold text-gray-800">
                      {product.condition || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                    <span className="text-gray-500 font-medium">
                      Available Stock
                    </span>
                    <span className="font-semibold text-gray-800">
                      {product.stock} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Sticky Checkout Card */}
          <aside>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 md:sticky md:top-24">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#3e9d24] bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                  {product.category_name || "Product"}
                </span>
                <h1 className="text-2xl font-black text-gray-900 mt-2 leading-snug">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">
                    ETB {Number(product.price).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    product.stock > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} In Stock`
                    : "Out of stock"}
                </span>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50">
                <span className="text-sm font-semibold text-gray-600 pl-2">
                  Quantity
                </span>
                <div className="flex items-center gap-3 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center rounded-md font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    −
                  </button>
                  <span className="font-bold text-sm w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 flex items-center justify-center rounded-md font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Alert Feedback Banner */}
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium text-center ${
                    message.includes("added")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={addToCart}
                  disabled={addingToCart || product.stock < 1}
                  className="w-full bg-[#3e9d24] hover:bg-[#34881e] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {addingToCart
                    ? "Adding to Cart..."
                    : product.stock < 1
                      ? "Out of Stock"
                      : "Add to Cart"}
                </button>

                <Link
                  to="/cart"
                  className="block text-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 text-sm"
                >
                  View Cart
                </Link>
              </div>

              {/* Vendor / Guarantee Info */}
              <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-800 font-bold flex items-center justify-center shrink-0">
                  T21
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Tome21 Official Guarantee
                  </h4>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
