import { useState } from "react";
import { Link } from "react-router-dom";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d2e] focus-visible:ring-offset-2";

const formatPrice = (value) => {
  const n = Number(value);
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(n)
  ) {
    return value ?? "";
  }
  // 12500 -> 12,500 and 99.5 -> 99.50
  return n.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Props
 * - product: { id, name, price, image_url, stock, category_name }
 * - onClick(product): optional, runs when the card is clicked
 * - onAddToCart(product): optional, shows an "Add to cart" button when provided
 */
const ProductCard = ({ product, onClick, onAddToCart }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const hasStock = product.stock !== undefined && product.stock !== null;
  const stock = Number(product.stock);
  const outOfStock = hasStock && stock <= 0;
  const lowStock = hasStock && stock > 0 && stock <= 5;

  return (
    <article
      onClick={() => onClick?.(product)}
      className="group relative flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow duration-200 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imgFailed || !product.image_url ? (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none ${
              outOfStock ? "opacity-60" : ""
            }`}
          />
        )}

        {lowStock && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
            Only {stock} left
          </span>
        )}

        {outOfStock && (
          <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
            Out of stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-3 sm:p-4">
        {product.category_name && (
          <p className="text-xs text-gray-500 truncate mb-1">
            {product.category_name}
          </p>
        )}

        {/* Stretched link: the whole card is clickable, one tab stop */}
        <h3 className="text-sm sm:text-base font-medium text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#e11d2e] transition-colors">
          <Link
            to={`/products/${product.id}`}
            className={`rounded after:absolute after:inset-0 after:content-[''] ${focusRing}`}
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-3">
          <p className="text-lg sm:text-xl font-bold text-[#e11d2e] leading-none">
            <span className="text-xs sm:text-sm font-semibold mr-1">ETB</span>
            {formatPrice(product.price)}
          </p>

          {onAddToCart && (
            <button
              type="button"
              disabled={outOfStock}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className={`relative z-10 mt-3 w-full rounded-lg py-2 text-sm font-semibold transition-colors ${focusRing} ${
                outOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#e11d2e] text-white hover:bg-[#b5121f]"
              }`}
            >
              {outOfStock ? "Out of stock" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
