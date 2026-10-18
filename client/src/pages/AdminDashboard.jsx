import { Link, Navigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ProductsManager from "../components/admin/ProductsManager";
import CategoriesManager from "../components/admin/CategoriesManager";
import OrdersManager from "../components/admin/OrdersManager";

const TABS = [
  { id: "orders", label: "Orders", Component: OrdersManager },
  { id: "products", label: "Products", Component: ProductsManager },
  { id: "categories", label: "Categories", Component: CategoriesManager },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab lives in the URL (?tab=products): survives refresh, works with back button
  const requested = searchParams.get("tab");
  const active = TABS.find((t) => t.id === requested) || TABS[0];

  const selectTab = (id) => setSearchParams({ tab: id }, { replace: true });

  // Arrow keys / Home / End move between tabs
  const handleKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === active.id);
    let next = null;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    selectTab(TABS[next].id);
    document.getElementById(`admin-tab-${TABS[next].id}`)?.focus();
  };

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title row */}
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link
                to="/"
                aria-label="Back to store"
                title="Back to store"
                className="w-8 h-8 bg-[#3e9d24] text-white flex items-center justify-center rounded-lg font-bold hover:bg-[#2f7d1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2"
              >
                T
              </Link>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Tome21 <span className="text-slate-400 font-medium">Admin</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className="hidden sm:block text-slate-500 truncate max-w-[12rem]">
                {user.name}
              </span>
              <Link
                to="/"
                className="rounded-lg px-3 py-1.5 font-semibold text-[#2f7d1b] hover:bg-green-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24]"
              >
                View store
              </Link>
            </div>
          </div>

          {/* Tabs row */}
          <div
            role="tablist"
            aria-label="Admin sections"
            onKeyDown={handleKeyDown}
            className="-mb-px flex gap-1 overflow-x-auto"
          >
            {TABS.map((tab) => {
              const selected = tab.id === active.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`admin-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectTab(tab.id)}
                  className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:bg-green-50 ${
                    selected
                      ? "border-[#3e9d24] text-[#2f7d1b]"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main
        id={`admin-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`admin-tab-${active.id}`}
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
      >
        <Component />
      </main>
    </div>
  );
}