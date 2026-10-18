import { Link } from "react-router-dom";

const ProductCard = ({ product, onClick }) => {
  // Convert price string to number for formatting
  const numericPrice = Number(product.price);
  const formattedPrice = isNaN(numericPrice)
    ? product.price
    : numericPrice.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer relative"
    >
      {/* Image Container */}
      <Link to={`/products/${product.id}`}>
        {" "}
        <div className="h-48 bg-gray-100 relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/*  Stock Badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Only {product.stock} Left
            </span>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Badge with Correct Tag Icon */}
        <div className="flex items-center text-xs text-gray-500 mb-1.5 gap-1">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 7h.01M7 3h5a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-7-7A1 1 0 013 12V5a2 2 0 012-2z"
            />
          </svg>
          <span className="truncate">{product.category_name}</span>
        </div>

        {/* Product Title */}
        <h4 className="text-gray-800 font-medium line-clamp-2 leading-snug group-hover:text-[#3e9d24] transition-colors mb-2">
          {product.name}
        </h4>

        {/* Price & Action */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">
              Price
            </span>
            <p className="text-[#3e9d24] text-lg font-bold leading-none">
              ETB {formattedPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
