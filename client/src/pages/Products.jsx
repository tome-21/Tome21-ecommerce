import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import ProductCardSkeleton from "../components/ProductCardSkeleton";

const apiEndpoint = import.meta.env.VITE_API_URL;

const PAGE_SIZE = 12;

const SORTS = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const CONDITIONS = [
  { value: "", label: "Any condition" },
  { value: "new", label: "Brand new" },
  { value: "used", label: "Used or refurbished" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2";

const Icon = ({ children, className = "w-4 h-4" }) => (
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

const fmt = (v) => Number(v).toLocaleString("en-US");

/* ------------------------------------------------------------------ */
/* Category picture, with a letter fallback                            */
/* ------------------------------------------------------------------ */
function CategoryThumb({ category, className = "w-8 h-8" }) {
  const [failed, setFailed] = useState(false);

  if (!category.image_url || failed) {
    return (
      <span
        className={`${className} shrink-0 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center`}
        aria-hidden="true"
      >
        {(category.name || "?").charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={category.image_url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-full object-cover bg-gray-100 border border-gray-200`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Sort dropdown (custom listbox with keyboard support)                */
/* ------------------------------------------------------------------ */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);

  const selectedIndex = Math.max(
    0,
    SORTS.findIndex((s) => s.value === value),
  );
  const selected = SORTS[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const choose = (v) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive(selectedIndex);
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % SORTS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + SORTS.length) % SORTS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(SORTS[active].value);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative flex-1 sm:flex-none">
      <button
        type="button"
        onClick={() => {
          setActive(selectedIndex);
          setOpen((o) => !o);
        }}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="sort-listbox"
        aria-activedescendant={open ? `sort-opt-${active}` : undefined}
        className={`w-full sm:w-56 flex items-center justify-between gap-2 border rounded-lg bg-white px-3 py-2 text-sm transition-colors ${focusRing} ${
          open ? "border-[#3e9d24]" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <span className="truncate">
          <span className="text-gray-500">Sort: </span>
          <span className="font-semibold text-gray-800">{selected.label}</span>
        </span>
        <Icon
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </Icon>
      </button>

      {open && (
        <ul
          id="sort-listbox"
          role="listbox"
          aria-label="Sort products"
          className="absolute right-0 z-20 mt-2 w-full min-w-[14rem] bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-1 overflow-hidden"
        >
          {SORTS.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={`sort-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(opt.value)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer ${
                  i === active ? "bg-green-50" : ""
                } ${
                  isSelected ? "text-[#2f7d1b] font-semibold" : "text-gray-700"
                }`}
              >
                {opt.label}
                {isSelected && (
                  <Icon className="w-4 h-4 text-[#3e9d24]">
                    <path d="M5 13l4 4L19 7" />
                  </Icon>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filter panel: used in the desktop sidebar and the mobile drawer     */
/* ------------------------------------------------------------------ */
function FilterPanel({
  categories,
  category,
  onCategory,
  condition,
  onCondition,
  minDraft,
  maxDraft,
  onMinDraft,
  onMaxDraft,
  onApplyPrice,
  priceError,
  idPrefix,
}) {
  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3e9d24] focus:ring-1 focus:ring-[#3e9d24]";

  return (
    <div className="divide-y divide-gray-100">
      {/* Category */}
      <section className="pb-4">
        <h3 className="font-bold text-gray-900 text-sm mb-2">Category</h3>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onCategory("")}
              aria-pressed={category === ""}
              className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg text-sm transition-colors ${focusRing} ${
                category === ""
                  ? "bg-green-50 text-[#2f7d1b] font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span
                className="w-8 h-8 shrink-0 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
                aria-hidden="true"
              >
                <Icon>
                  <path d="M4 6h6v6H4zM14 6h6v6h-6zM4 16h6v4H4zM14 16h6v4h-6z" />
                </Icon>
              </span>
              All categories
            </button>
          </li>
          {categories.map((c) => {
            const active = category === String(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onCategory(String(c.id))}
                  aria-pressed={active}
                  className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg text-sm transition-colors ${focusRing} ${
                    active
                      ? "bg-green-50 text-[#2f7d1b] font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <CategoryThumb category={c} />
                  <span className="truncate">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Price */}
      <section className="py-4">
        <h3 className="font-bold text-gray-900 text-sm mb-2">Price (ETB)</h3>
        <form onSubmit={onApplyPrice} noValidate>
          <div className="flex items-center gap-2">
            <label htmlFor={`${idPrefix}-min`} className="sr-only">
              Minimum price
            </label>
            <input
              id={`${idPrefix}-min`}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Min"
              value={minDraft}
              onChange={(e) => onMinDraft(e.target.value)}
              className={inputClass}
            />
            <span className="text-gray-400">to</span>
            <label htmlFor={`${idPrefix}-max`} className="sr-only">
              Maximum price
            </label>
            <input
              id={`${idPrefix}-max`}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Max"
              value={maxDraft}
              onChange={(e) => onMaxDraft(e.target.value)}
              className={inputClass}
            />
          </div>
          {priceError && (
            <p role="alert" className="text-xs text-red-600 mt-2">
              {priceError}
            </p>
          )}
          <button
            type="submit"
            className={`mt-3 w-full border border-[#3e9d24] text-[#2f7d1b] font-semibold text-sm py-2 rounded-lg hover:bg-green-50 transition-colors ${focusRing}`}
          >
            Apply price
          </button>
        </form>
      </section>

      {/* Condition */}
      <section className="pt-4">
        <h3 className="font-bold text-gray-900 text-sm mb-2">Condition</h3>
        <div className="space-y-1">
          {CONDITIONS.map((opt) => (
            <label
              key={opt.value || "any"}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name={`${idPrefix}-condition`}
                checked={condition === opt.value}
                onChange={() => onCondition(opt.value)}
                className="w-4 h-4 accent-[#3e9d24]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the single source of truth for every filter
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";
  const urlMin = searchParams.get("min") || "";
  const urlMax = searchParams.get("max") || "";
  const sort = searchParams.get("sort") || "newest";
  const condition = searchParams.get("condition") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Price inputs are drafts until the user applies them
  const [minDraft, setMinDraft] = useState(urlMin);
  const [maxDraft, setMaxDraft] = useState(urlMax);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    setMinDraft(urlMin);
    setMaxDraft(urlMax);
    setPriceError("");
  }, [urlMin, urlMax]);

  const updateParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  /* Categories (once) */
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`${apiEndpoint}/categories`, { signal: controller.signal })
      .then(({ data }) => setCategories(data))
      .catch((err) => {
        if (!axios.isCancel(err))
          console.error("Failed to fetch categories:", err);
      });
    return () => controller.abort();
  }, []);

  /* Products (whenever a filter changes) */
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      setVisible(PAGE_SIZE);
      try {
        const { data } = await axios.get(`${apiEndpoint}/products`, {
          signal: controller.signal,
          params: {
            q: q || undefined,
            categoryId: category || undefined,
            minPrice: urlMin || undefined,
            maxPrice: urlMax || undefined,
            sortBy: sort || undefined,
            condition: condition || undefined,
          },
        });
        setProducts(data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Failed to fetch products:", err);
        setError(
          "We couldn't load the products. Check your connection and try again.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [q, category, urlMin, urlMax, sort, condition, reloadKey]);

  /* Mobile drawer: lock page scroll and close on Escape */
  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setFiltersOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  const applyPrice = (e) => {
    e.preventDefault();
    if (minDraft && maxDraft && Number(minDraft) > Number(maxDraft)) {
      setPriceError("Minimum price can't be higher than maximum.");
      return;
    }
    setPriceError("");
    updateParams({ min: minDraft, max: maxDraft });
  };

  const clearAll = () => {
    setSearchParams({});
    setFiltersOpen(false);
  };

  const categoryName = categories.find((c) => String(c.id) === category)?.name;

  /* Removable chips for every active filter */
  const chips = [];
  if (q) chips.push({ key: "q", label: `Search: “${q}”`, clear: { q: "" } });
  if (category && categoryName)
    chips.push({
      key: "category",
      label: categoryName,
      clear: { category: "" },
    });
  if (urlMin || urlMax) {
    const label =
      urlMin && urlMax
        ? `ETB ${fmt(urlMin)} – ${fmt(urlMax)}`
        : urlMin
          ? `From ETB ${fmt(urlMin)}`
          : `Up to ETB ${fmt(urlMax)}`;
    chips.push({ key: "price", label, clear: { min: "", max: "" } });
  }
  if (condition) {
    chips.push({
      key: "condition",
      label: CONDITIONS.find((c) => c.value === condition)?.label || condition,
      clear: { condition: "" },
    });
  }
  const hasFilters = chips.length > 0;

  const title = categoryName || (q ? `Results for “${q}”` : "All products");
  const countText = loading
    ? "Loading…"
    : `${products.length} ${products.length === 1 ? "product" : "products"}`;

  const panelProps = {
    categories,
    category,
    onCategory: (id) => updateParams({ category: id }),
    condition,
    onCondition: (v) => updateParams({ condition: v }),
    minDraft,
    maxDraft,
    onMinDraft: setMinDraft,
    onMaxDraft: setMaxDraft,
    onApplyPrice: applyPrice,
    priceError,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-4 sm:py-6 flex gap-6 items-start">
        {/* Desktop sidebar */}
        <aside
          aria-label="Filters"
          className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto bg-white rounded-xl border border-gray-200 p-4"
        >
          <FilterPanel {...panelProps} idPrefix="side" />
        </aside>

        <section className="flex-1 min-w-0">
          {/* Title, count, sort */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5" aria-live="polite">
                  {countText}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className={`lg:hidden flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 ${focusRing}`}
                >
                  <Icon>
                    <path d="M3 5h18M6 12h12M10 19h4" />
                  </Icon>
                  Filters
                  {chips.length > 0 && (
                    <span className="bg-[#3e9d24] text-white text-xs rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
                      {chips.length}
                    </span>
                  )}
                </button>

                <SortDropdown
                  value={sort}
                  onChange={(v) =>
                    updateParams({ sort: v === "newest" ? "" : v })
                  }
                />
              </div>
            </div>

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                {chips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 bg-green-50 text-[#2f7d1b] text-xs font-semibold pl-3 pr-1.5 py-1 rounded-full"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={() => updateParams(chip.clear)}
                      aria-label={`Remove filter: ${chip.label}`}
                      className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-green-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24]"
                    >
                      <Icon className="w-3 h-3">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </Icon>
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className={`text-xs font-semibold text-gray-500 hover:text-gray-800 underline rounded ${focusRing}`}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Quick categories on mobile */}
          <div
            className="lg:hidden flex gap-2 overflow-x-auto pb-3 -mx-4 px-4"
            style={{ scrollbarWidth: "none" }}
          >
            {[{ id: "", name: "All" }, ...categories].map((c) => {
              const active = category === String(c.id);
              return (
                <button
                  key={c.id || "all"}
                  type="button"
                  onClick={() => updateParams({ category: String(c.id) })}
                  aria-pressed={active}
                  className={`shrink-0 flex items-center gap-2 py-1 rounded-full text-sm font-medium border transition-colors ${focusRing} ${
                    c.id === "" ? "px-4" : "pl-1 pr-4"
                  } ${
                    active
                      ? "bg-[#3e9d24] border-[#3e9d24] text-white"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {c.id !== "" && (
                    <CategoryThumb category={c} className="w-7 h-7" />
                  )}
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Results */}
          {error ? (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <p className="text-sm">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className={`self-start sm:self-auto bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 ${focusRing}`}
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 sm:p-16 text-center">
              <h2 className="text-lg font-bold text-gray-900">
                No products found
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                {hasFilters
                  ? "Nothing matches your filters. Try removing one or searching for something else."
                  : "New items will appear here soon."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className={`mt-5 bg-[#3e9d24] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#2f7d1b] transition-colors ${focusRing}`}
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.slice(0, visible).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {products.length > visible && (
                <div className="flex flex-col items-center gap-2 mt-8">
                  <p className="text-xs text-gray-500">
                    Showing {Math.min(visible, products.length)} of{" "}
                    {products.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className={`border border-[#3e9d24] text-[#2f7d1b] bg-white font-semibold px-8 py-2.5 rounded-full hover:bg-green-50 transition-colors ${focusRing}`}
                  >
                    Show more
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 ${focusRing}`}
              >
                <Icon className="w-5 h-5">
                  <path d="M6 18L18 6M6 6l12 12" />
                </Icon>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel {...panelProps} idPrefix="drawer" />
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className={`px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 ${focusRing}`}
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className={`flex-1 bg-[#3e9d24] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#2f7d1b] ${focusRing}`}
              >
                {loading
                  ? "Show results"
                  : `Show ${products.length} ${products.length === 1 ? "product" : "products"}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
