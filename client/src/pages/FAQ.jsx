import Header from "../components/Header";
import Footer from "../components/Footer";

const FAQS = [
  { q: "How do I pay for my order?", a: "You can pay via Telebirr or Commercial Bank of Ethiopia (CBE) using the account details listed at checkout. Remember to copy your transaction reference number!" },
  { q: "How long does delivery take?", a: "Delivery timelines depend on your location within Ethiopia and product availability. We keep you updated upon order confirmation." },
  { q: "Can I request custom anime hoodies or designs?", a: "Yes! Tome21 specializes in custom customer orders. Reach out through our contact channel with your specifications." },
  { q: "How do I know my payment is verified?", a: "Once you submit your transaction reference number in the cart, our team verifies the transfer against our bank records before processing dispatch." }
];

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-xs text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-sm text-gray-500">Find answers to common questions about ordering, payments, and delivery.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">{faq.q}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}