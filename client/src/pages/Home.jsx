import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { Link } from "react-router-dom";

const apiEndpoint = import.meta.env.VITE_API_URL;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
      <div className="h-40 bg-gray-200 rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          axios.get(`${apiEndpoint}/categories`),
          axios.get(`${apiEndpoint}/products/top`),
        ]);
        setCategories(categoriesRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 flex flex-col space-y-10">
        {/* Hero */}
        <div className="w-full min-h-[18rem] bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] rounded-3xl shadow-xl flex items-center justify-between p-8 md:p-12 relative overflow-hidden">
          <div className="z-10 text-white max-w-lg">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow">
              Shop the best quality products
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Premium electronics, fashion, and more delivered to you without
              the hassle.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <button className="bg-[#e11d2e] text-white px-7 py-3 rounded-full font-bold hover:bg-[#b5121f] hover:scale-105 transition shadow-lg cursor-pointer">
                  Order now
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-2xl font-bold text-gray-800">
              Shop by <span className="text-[#e11d2e]">Category</span>
            </h3>
            <Link
              to="/products"
              className="text-sm font-semibold text-[#e11d2e] hover:text-[#b5121f] transition"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`}>
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-full overflow-hidden shadow-sm ring-2 ring-transparent group-hover:ring-[#e11d2e] flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg">
                    <img
                      src={category.image_url}
                      alt={category.name || "Category image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium mt-2 text-gray-700 group-hover:text-[#e11d2e] transition-colors text-center">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending products */}
        <section id="trending">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-1.5 h-7 bg-[#e11d2e] rounded-full" />
              Top Products
            </h3>
            <Link
              to="/products"
              className="text-sm font-semibold text-[#e11d2e] hover:text-[#b5121f] transition"
            >
              See more →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
          {!loading && products.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              No products to show right now.
            </p>
          )}
        </section>

        {/* Bottom CTA banner */}
        <section className="rounded-3xl bg-gradient-to-r from-[#111827] to-[#1f2937] text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-2">
              Leave the hassle of delivery to us
            </h3>
            <p className="text-gray-300">
              Anything you want, delivered shop now and we'll handle the rest.
            </p>
          </div>
          <Link to="/products">
            <button className="bg-[#e11d2e] text-white px-8 py-3 rounded-full font-bold hover:bg-[#b5121f] hover:scale-105 transition shadow-md whitespace-nowrap cursor-pointer">
              Start Shopping
            </button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
