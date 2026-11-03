const inputClass = (hasError) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white transition-all focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-400/20 focus:border-red-500"
      : "border-gray-200 focus:ring-[#3e9d24]/20 focus:border-[#3e9d24]"
  }`;

export default function PaymentSection({
  total,
  payment,
  touched,
  onChange,
  onBlur,
  setPayment,
}) {
  const money = (n) => Number(n).toLocaleString("en-US");

  const referenceError =
    touched.reference && !payment.reference.trim()
      ? "Enter your transaction reference."
      : "";
  const suffixError =
    touched.accountSuffix &&
    payment.method === "cbe" &&
    payment.accountSuffix.trim().length !== 8
      ? "Enter the last 8 digits of your CBE account."
      : "";

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Payment & Verification
      </h2>
      <p className="text-xs text-gray-500 mb-5">
        Transfer the total amount, select the channel, and enter your reference.
      </p>

      {/* Modern instructions box */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-green-50/70 to-emerald-50/30 border border-green-100 p-4 text-sm">
        <p className="font-bold text-[#2f7d1b] mb-3">
          Step 1: Transfer ETB {money(total)} to one of our accounts:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {/* Telebirr Details */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3">
            <img src="/telebirr-logo.svg" alt="Telebirr" className="w-8 h-8 rounded-md object-contain shrink-0" />
            <div>
              <p className="font-bold text-gray-900">Telebirr Account</p>
              <p className="text-gray-500 text-xs mt-0.5">Name: <span className="font-semibold text-gray-700">Tomas Tesfaye</span></p>
              <p className="text-gray-500 text-xs">Number: <span className="font-mono font-bold text-gray-900">09*********</span></p>
            </div>
          </div>

          {/* CBE Details */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3">
            <img src="/cbe-logo.svg" alt="CBE" className="w-8 h-8 rounded-md object-contain shrink-0" />
            <div>
              <p className="font-bold text-gray-900">CBE Account</p>
              <p className="text-gray-500 text-xs mt-0.5">Name: <span className="font-semibold text-gray-700">Tomas Tesfaye</span></p>
              <p className="text-gray-500 text-xs">Account: <span className="font-mono font-bold text-gray-900">1000*********</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Step 2: Select Payment Method Used
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPayment((prev) => ({ ...prev, method: "telebirr" }))}
              className={`flex items-center justify-center gap-3.5 border rounded-xl py-3 px-4 transition-all duration-200 cursor-pointer ${
                payment.method === "telebirr"
                  ? "border-[#3e9d24] bg-green-50/50 ring-2 ring-[#3e9d24]/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <img src="/telebirr-logo.svg" alt="" className="w-6 h-6 object-contain" />
              <span className={`text-sm font-bold ${payment.method === "telebirr" ? "text-[#2f7d1b]" : "text-gray-700"}`}>
                Telebirr
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPayment((prev) => ({ ...prev, method: "cbe" }))}
              className={`flex items-center justify-center gap-3.5 border rounded-xl py-3 px-4 transition-all duration-200 cursor-pointer ${
                payment.method === "cbe"
                  ? "border-[#3e9d24] bg-green-50/50 ring-2 ring-[#3e9d24]/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <img src="/cbe-logo.svg" alt="" className="w-6 h-6 object-contain" />
              <span className={`text-sm font-bold ${payment.method === "cbe" ? "text-[#2f7d1b]" : "text-gray-700"}`}>
                CBE
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label htmlFor="reference" className="block text-xs font-semibold text-gray-700 mb-1">
              Transaction Reference / Receipt No
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              value={payment.reference}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={payment.method === "telebirr" ? "e.g. DIR56OU8WP" : "e.g. FT26184843Q8"}
              aria-invalid={!!referenceError}
              className={inputClass(!!referenceError)}
            />
            {referenceError && (
              <p className="text-xs font-semibold text-red-500 mt-1">{referenceError}</p>
            )}
          </div>

          {payment.method === "cbe" && (
            <div>
              <label htmlFor="accountSuffix" className="block text-xs font-semibold text-gray-700 mb-1">
                Account Suffix (Last 8 digits)
              </label>
              <input
                id="accountSuffix"
                name="accountSuffix"
                type="text"
                maxLength={8}
                value={payment.accountSuffix}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="e.g. 12345729"
                aria-invalid={!!suffixError}
                className={inputClass(!!suffixError)}
              />
              {suffixError && (
                <p className="text-xs font-semibold text-red-500 mt-1">{suffixError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}