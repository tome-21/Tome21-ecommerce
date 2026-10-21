import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ProductsManager from "../components/admin/productsManager/ProductsManager";
import CategoriesManager from "../components/admin/CategoriesManager";
import OrdersManager from "../components/admin/OrdersManager";

const TABS = [
  { id: "orders", label: "Orders", Component: OrdersManager },
  { id: "products", label: "Products", Component: ProductsManager },
  { id: "categories", label: "Categories", Component: CategoriesManager },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  // Active section lives in the URL (?tab=products): survives refresh, works with back button
  const requested = searchParams.get("tab");
  const active = TABS.find((t) => t.id === requested) || TABS[0];

  const selectTab = (id) => {
    setSearchParams({ tab: id }, { replace: true });
    setMenuOpen(false);
  };

  // Mobile drawer: lock page scroll and close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const { Component } = active;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-[#111827] text-white flex items-center gap-3 px-4 shadow-md">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
          className={`w-9 h-9 -ml-1 rounded-lg flex items-center justify-center hover:bg-white/10 ${focusRing}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="w-6 h-6"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-black tracking-tight">
          Tome<span className="text-[#e11d2e]">21</span>
        </span>
        <span className="ml-auto text-sm font-medium text-gray-300">
          {active.label}
        </span>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 lg:z-30 w-64 lg:w-60 bg-[#111827] text-white flex flex-col transition-[transform,visibility] duration-200 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full max-lg:invisible"
        }`}
      >
        {/* Brand */}
        <div className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-white/10">
          <Link
            to="/"
            aria-label="Back to store"
            className={`rounded text-xl font-black tracking-tight ${focusRing}`}
          >
            Tome<span className="text-[#e11d2e]">21</span>
            <span className="ml-2 text-sm font-medium text-gray-400">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className={`lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 ${focusRing}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {TABS.map((tab) => {
              const selected = tab.id === active.id;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => selectTab(tab.id)}
                    aria-current={selected ? "page" : undefined}
                    className={`w-full text-left rounded-lg px-3 py-2.5 text-sm font-semibold border-l-4 transition-colors ${focusRing} ${
                      selected
                        ? "bg-white/10 text-white border-[#e11d2e]"
                        : "text-gray-300 border-transparent hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + back to store */}
        <div className="shrink-0 border-t border-white/10 p-4 space-y-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user.name}
            </p>
            {user.email && (
              <p className="truncate text-xs text-gray-400">{user.email}</p>
            )}
          </div>
          <Link
            to="/"
            className={`block w-full text-center rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors ${focusRing}`}
          >
            View store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main
        id={`admin-panel-${active.id}`}
        aria-label={active.label}
        className="lg:pl-60"
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Component />
        </div>
      </main>
    </div>
  );
}
