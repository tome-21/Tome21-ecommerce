import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";

const apiEndpoint = import.meta.env.VITE_API_URL;

// Reusable Category Skeleton Component
const CategorySkeleton = () => (
  <div className="flex flex-col items-center animate-pulse">
    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
    <div className="h-4 w-12 bg-gray-200 rounded mt-2"></div>
  </div>
);

// Reusable Product Card Skeleton Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col space-y-3 animate-pulse">
    <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        // Fetch concurrently for maximum speed
        const [categoriesRes, productsRes] = await Promise.all([
          axios.get(`${apiEndpoint}/categories`),
          axios.get(`${apiEndpoint}/products/top`),
        ]);

        setCategories(categoriesRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Failed to load home page data:", err);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 flex flex-col space-y-8">
        {/* Pro Hero / Carousel */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 pt-4 pb-6 flex flex-col space-y-6">
          <HeroBanner />
        </main>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-center text-sm font-medium">
            {error}
          </div>
        )}

        {/* Categories Section */}
        <section>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <CategorySkeleton key={index} />
                ))
              : categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-white rounded-full overflow-hidden shadow-sm flex items-center justify-center text-[#3e9d24] group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1">
                      <img
                        src={category.image_url}
                        alt={category.name || "Category image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium mt-2 text-gray-700 group-hover:text-[#3e9d24] transition-colors text-center">
                      {category.name}
                    </span>
                  </Link>
                ))}
          </div>
        </section>

        {/* Product Section */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Trending Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              : products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
