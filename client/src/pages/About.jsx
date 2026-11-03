import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-10">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-xs text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            About Tome<span className="text-[#3e9d24]">21</span> Store
          </h1>
          <p className="text-lg font-semibold text-[#2f7d1b]">
            Your Tradition. Your Style. Your Choice.
          </p>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
            Tome21 Store is an online shopping business specializing in beautiful traditional and modern Ethiopian fashion[cite: 2]. We aim to bring customers stylish, quality clothing that celebrates Ethiopian culture and identity[cite: 2].
          </p>
        </div>

        {/* What We Offer / Products & Services */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Our Products & Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-1">Traditional Ethiopian Fashion</h3>
              <p className="text-xs text-gray-500">Beautiful traditional clothing tailored for different occasions and celebrations[cite: 2].</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-1">Modern Fashion</h3>
              <p className="text-xs text-gray-500">Trendy fashion items for customers who enjoy contemporary styles[cite: 2].</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-1">Custom Anime Hoodies</h3>
              <p className="text-xs text-gray-500">Anime-inspired hoodies for fans who want to express their unique interests through fashion[cite: 2].</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-1">Custom Customer Orders</h3>
              <p className="text-xs text-gray-500">Tell us what you are looking for, and we will work to fulfill your request[cite: 2].</p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Our Mission</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              To provide customers with beautiful traditional fashion and convenient access to products they want while building trust through reliable service[cite: 2].
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Our Vision</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              To grow Tome21 Store into a trusted online shopping brand known for Ethiopian traditional fashion, stellar customer service, and a diverse range of products[cite: 2].
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}