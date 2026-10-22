import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { Link } from "react-router-dom";

const apiEndpoint = import.meta.env.VITE_API_URL;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const categories = await axios.get(`${apiEndpoint}/categories`);
        const products = await axios.get(`${apiEndpoint}/products/top`);
        setCategories(categories.data);
        setProducts(products.data);
      } catch (error) {
        console.error(error.message);
      } finally {
        // setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 flex flex-col space-y-8">
        {/* Pro Hero / Carousel */}
        <div className="w-full h-72 bg-gradient-to-r from-[#3e9d24] to-green-400 rounded-2xl shadow-md flex items-center justify-between p-10 relative overflow-hidden group">
          <div className="z-10 text-white max-w-md">
            <h2 className="text-4xl font-extrabold mb-3 drop-shadow-sm">
              Shop the best quality products
            </h2>
            <p className="text-lg text-green-50 mb-6 drop-shadow-sm">
              Premium electronics, fashion, and more delivered to you.
            </p>
            <Link to="/products">
              <button className="bg-white text-[#3e9d24] px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-sm cursor-pointer">
                Start Shopping
              </button>
            </Link>
          </div>
          <div className="absolute right-0 top-0 w-64 h-full bg-white opacity-10 skew-x-12 transform translate-x-10"></div>
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
        </div>

        {/* Categories */}
        <section>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link to={`/products?category=${category.id}`}>
                <div
                  key={category.id}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-white rounded-full overflow-hidden shadow-sm flex items-center justify-center text-[#3e9d24] group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1">
                    <img
                      src={category.image_url}
                      alt={category.name || "Category image"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span className="text-sm font-medium mt-2 text-gray-700 group-hover:text-[#3e9d24] transition-colors">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/*  Product */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Trending Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
