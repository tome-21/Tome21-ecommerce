import { useState, useEffect } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import HeaderAuth from "./HeaderAuth";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]";

const HIDE_SEARCH_PATHS = ["/cart", "/checkout", "/orders"];

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

const SearchIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </Icon>
);

function SearchBar({ value, onChange, onSubmit, onClear, className = "" }) {
  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`flex items-stretch bg-white rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#e11d2e] ${className}`}
    >
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <div className="relative flex-1 min-w-0">
        <input
          id="site-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What are you looking for?"
          autoComplete="off"
          enterKeyHint="search"
          className="w-full h-full pl-4 pr-9 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d2e]"
          >
            &times;
          </button>
        )}
      </div>
      <button
        type="submit"
        aria-label="Search"
        className="px-4 sm:px-5 bg-[#e11d2e] hover:bg-[#b5121f] text-white transition-colors focus-visible:outline-none focus-visible:bg-[#b5121f]"
      >
        <SearchIcon className="w-5 h-5" />
      </button>
    </form>
  );
}

/**
 * Props
 * - cartCount: optional number. Shows a badge on the cart button when > 0.
 */
export default function Header({ cartCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Keep the input in sync with the ?q= in the URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const shouldShowSearch = !HIDE_SEARCH_PATHS.includes(location.pathname);
  const onOrders = location.pathname === "/orders";
  const onCart = location.pathname === "/cart";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    navigate(`/products?q=${encodeURIComponent(query)}`);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    if (location.pathname === "/products" && searchParams.has("q")) {
      const next = new URLSearchParams(searchParams);
      next.delete("q");
      const qs = next.toString();
      navigate(qs ? `/products?${qs}` : "/products");
    }
  };

  const searchProps = {
    value: searchTerm,
    onChange: setSearchTerm,
    onSubmit: handleSearchSubmit,
    onClear: handleClearInput,
  };

  return (
    <header className="sticky top-0 z-50 bg-[#111827] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-6">
        {/* Logo */}
        <Link
          to="/"
          className={`text-2xl sm:text-3xl font-black tracking-tight shrink-0 rounded ${focusRing}`}
          aria-label="Tome21 home"
        >
          Tome<span className="text-[#e11d2e]">21</span>
        </Link>

        {/* Desktop search */}
        {shouldShowSearch ? (
          <SearchBar
            {...searchProps}
            className="hidden md:flex flex-1 max-w-2xl"
          />
        ) : (
          <div className="hidden md:block flex-1" />
        )}

        {/* Actions */}
        <nav
          aria-label="Account and cart"
          className="ml-auto md:ml-0 flex items-center gap-1 sm:gap-2"
        >
          <HeaderAuth />

          <Link
            to="/orders"
            title="My orders"
            aria-current={onOrders ? "page" : undefined}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${focusRing} ${
              onOrders ? "bg-white/25" : "hover:bg-white/15"
            }`}
          >
            <Icon className="w-6 h-6">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </Icon>
            <span className="hidden lg:inline">Orders</span>
          </Link>

          <Link
            to="/cart"
            aria-current={onCart ? "page" : undefined}
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${focusRing} ${
              onCart ? "bg-white/25" : "hover:bg-white/15"
            }`}
          >
            <Icon className="w-6 h-6">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </Icon>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 left-6 sm:left-5 min-w-[1.15rem] h-[1.15rem] px-1 flex items-center justify-center rounded-full bg-[#e11d2e] text-white text-[11px] font-bold leading-none"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* Mobile search */}
      {shouldShowSearch && (
        <div className="md:hidden px-4 pb-3">
          <SearchBar {...searchProps} className="flex" />
        </div>
      )}
    </header>
  );
}
