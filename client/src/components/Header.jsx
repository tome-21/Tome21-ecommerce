import { Link } from "react-router-dom";
import HeaderAuth from "./HeaderAuth";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#3e9d24] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-black tracking-tight shrink-0"
        >
          Tome<span className="text-yellow-300">21</span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="hidden md:flex flex-1 max-w-xl items-center bg-white rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400"
        >
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="px-4 py-2 text-[#3e9d24] hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>

        {/* Auth & Cart Actions */}
        <div className="flex items-center gap-3">
          <HeaderAuth />

          <Link
            to="/cart"
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
          >
            <svg
              className="w-5 h-5"
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
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full px-4 py-2 text-sm text-gray-800 bg-white rounded-lg placeholder-gray-400 focus:outline-none"
        />
      </div>
    </header>
  );
}
