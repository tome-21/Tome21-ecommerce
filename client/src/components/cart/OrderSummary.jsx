const money = (n) => Number(n).toLocaleString("en-US");

export default function OrderSummary({
  subtotal,
  total,
  itemCount,
  submitting,
  hasStockIssue,
  submitError,
}) {
  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Order Summary
      </h2>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <dt>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
          <dd className="font-semibold text-gray-900">ETB {money(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-gray-600">
          <dt>Delivery Fee</dt>
          <dd className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded">
            Calculated / Free
          </dd>
        </div>
      </dl>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-baseline justify-between">
        <span className="font-bold text-gray-900">Total</span>
        <span className="text-2xl font-black text-[#2f7d1b]">
          ETB {money(total)}
        </span>
      </div>

      {submitError && (
        <p role="alert" className="mt-4 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || hasStockIssue}
        className="hidden lg:flex items-center justify-center mt-6 w-full bg-[#3e9d24] text-white font-bold py-3.5 rounded-xl hover:bg-[#2f7d1b] active:scale-[0.99] transition-all duration-200 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? "Verifying & Placing..." : "Place Order"}
      </button>

      <p className="hidden lg:block mt-3 text-xs text-gray-400 text-center">
        Instant payment verification enabled
      </p>
    </aside>
  );
}