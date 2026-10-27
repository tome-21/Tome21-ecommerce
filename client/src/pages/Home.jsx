import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";

const apiEndpoint = import.meta.env.VITE_API_URL;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getData = useCallback(async (signal) => {
    setLoading(true);
    setError(false);
    try {
      const [cats, prods] = await Promise.all([
        axios.get(`${apiEndpoint}/categories`, { signal }),
        axios.get(`${apiEndpoint}/products/top`, { signal }),
      ]);
      setCategories(cats.data);
      setProducts(prods.data);
      setLoading(false);
    } catch (err) {
      if (axios.isCancel(err)) return; // component unmounted, ignore
      console.error(err.message);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getData(controller.signal);
    return () => controller.abort();
  }, [getData]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2f7d1b] via-[#3e9d24] to-green-400 shadow-lg">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-24 -bottom-10 w-40 h-40 rounded-full bg-yellow-300/30 blur-2xl" />

          <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 max-w-xl text-white">
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4">
              Shop the best quality products
            </h1>
            <p className="text-base sm:text-lg text-green-50 mb-7">
              Premium electronics, fashion, and more delivered to you.
            </p>

            <Link
              to="/products"
              className={`inline-block bg-white text-[#2f7d1b] px-7 py-3 rounded-full font-bold shadow-md hover:bg-green-50 hover:shadow-lg active:scale-95 transition ${focusRing}`}
            >
              Start Shopping
            </Link>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl py-12 px-4"
          >
            <p className="text-lg font-semibold text-gray-800">
              We couldn't load the store
            </p>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => getData()}
              className={`bg-[#3e9d24] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#2f7d1b] transition-colors ${focusRing}`}
            >
              Try again
            </button>
          </div>
        )}

        {/* Categories */}
        {!error && (loading || categories.length > 0) && (
          <section aria-labelledby="categories-heading">
            <h2
              id="categories-heading"
              className="text-xl sm:text-2xl font-bold text-gray-800 mb-5"
            >
              Shop by category
            </h2>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center animate-pulse motion-reduce:animate-none"
                      aria-hidden="true"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-200" />
                      <div className="h-3 w-12 bg-gray-200 rounded mt-3" />
                    </div>
                  ))
                : categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      className={`group flex flex-col items-center rounded-lg ${focusRing}`}
                    >
                      <div className="w-16 h-16 bg-white rounded-full overflow-hidden shadow-sm ring-1 ring-gray-200 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:ring-[#3e9d24]">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-[#3e9d24]">
                            {category.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-medium mt-2 text-gray-700 text-center line-clamp-1 group-hover:text-[#2f7d1b] transition-colors">
                        {category.name}
                      </span>
                    </Link>
                  ))}
            </div>
          </section>
        )}

        {/* Trending products */}
        {!error && (
          <section aria-labelledby="trending-heading">
            <div className="flex items-end justify-between mb-5">
              <h2
                id="trending-heading"
                className="text-xl sm:text-2xl font-bold text-gray-800"
              >
                Trending Products
              </h2>
              <Link
                to="/products"
                className={`text-sm font-semibold text-[#2f7d1b] hover:underline rounded ${focusRing}`}
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                aria-busy="true"
                aria-label="Loading products"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center text-gray-500">
                No products yet. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
