import { Link } from "react-router-dom";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2";
const money = (n) => Number(n).toLocaleString("en-US");

export default function CartItem({ item, busy, onUpdateQuantity, onRemove }) {
  const hasStock = item.stock !== undefined && item.stock !== null;
  const overStock = hasStock && item.quantity > item.stock;
  const atMax = hasStock && item.quantity >= item.stock;

  return (
    <li
      className={`flex gap-4 p-4 sm:p-5 transition-all duration-200 ${
        busy ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <Link
        to={`/products/${item.product_id}`}
        className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center ${focusRing}`}
        tabIndex={-1}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply p-2"
          />
        ) : (
          <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/products/${item.product_id}`}
              className={`font-semibold text-gray-900 hover:text-[#2f7d1b] transition-colors line-clamp-2 rounded ${focusRing}`}
            >
              {item.name}
            </Link>
            <p className="font-extrabold text-gray-900 shrink-0">
              ETB {money(Number(item.price) * item.quantity)}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            ETB {money(item.price)} each
          </p>

          {overStock && (
            <p className="text-xs font-semibold text-red-600 mt-1">
              {item.stock > 0
                ? `Only ${item.stock} available. Please lower the quantity.`
                : "Out of stock. Please remove this item."}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
              disabled={item.quantity <= 1 || busy}
              className={`w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-xs rounded-l-lg transition-all disabled:opacity-30 ${focusRing}`}
            >
              -
            </button>
            <span className="w-9 text-center text-xs font-bold text-gray-800">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
              disabled={atMax || busy}
              className={`w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-xs rounded-r-lg transition-all disabled:opacity-30 ${focusRing}`}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.product_id)}
            disabled={busy}
            className={`text-xs font-semibold text-red-500 hover:text-red-700 hover:underline rounded disabled:opacity-50 ${focusRing}`}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}