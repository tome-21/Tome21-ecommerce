// Mirrors the layout of ProductCard so nothing jumps when data arrives.
const ProductCardSkeleton = () => (
  <div
    className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse motion-reduce:animate-none"
    aria-hidden="true"
  >
    <div className="aspect-square bg-gray-200" />
    <div className="flex flex-col flex-grow p-3 sm:p-4">
      <div className="h-3 w-1/3 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      <div className="mt-auto pt-4">
        <div className="h-6 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
