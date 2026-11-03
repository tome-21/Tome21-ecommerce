import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-xs space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms and Conditions</h1>
            <p className="text-xs text-gray-400">Effective Date: October 26, 2026[cite: 5]</p>
          </div>

          <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. Welcome to Tome21 Store</h2>
              <p>
                These Terms and Conditions explain the basic rules for ordering traditional Ethiopian fashion, modern fashion, anime hoodies, and other customer-requested products[cite: 5]. Please review them carefully before placing any order[cite: 5].
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. Orders & Product Availability</h2>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Customers must provide accurate order specifications (item, size, color, design, and delivery info)[cite: 5].</li>
                <li>Orders are subject to product availability and supplier verification[cite: 5].</li>
                <li>An order is confirmed only after Tome21 verifies the item, total price, and payment terms[cite: 5].</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. Payments & Mobile Banking</h2>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>All prices and delivery fees are communicated upfront before order confirmation[cite: 5].</li>
                <li>Payments are made via bank transfer or mobile money using official store details[cite: 5]. Always verify account numbers[cite: 5].</li>
                <li>Keep your transaction reference or receipt safe until order completion[cite: 5].</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. Delivery & Cancellations</h2>
              <p>
                Estimated delivery timings depend on availability and location[cite: 6]. If you wish to cancel an order, contact us immediately[cite: 6]; cancellation viability depends on preparation status[cite: 6]. Defective or incorrect items must be reported promptly with supporting photos[cite: 6].
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}