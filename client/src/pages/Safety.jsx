import Header from "../components/Header";
import Footer from "../components/Footer";

const TIPS = [
  { title: "Check your order", desc: "Confirm the product, size, color, and price before paying[cite: 4]." },
  { title: "Pay safely", desc: "Use official payment details provided directly by Tome21 Store. Never share your PIN[cite: 4]." },
  { title: "Keep your receipt", desc: "Save your payment confirmation reference for your records[cite: 4]." },
  { title: "Order confirmation", desc: "We will verify your payment before processing and dispatching your order[cite: 4]." },
  { title: "Ask us anytime", desc: "Have questions? Contact us before placing your order to clear up any doubts[cite: 4]." },
  { title: "Your privacy", desc: "We respect your personal information and maintain strict confidentiality[cite: 4]." },
];

export default function Safety() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-xs text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-gray-900">Customer Safety Tips</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your trust matters to us! Follow these guidelines to ensure a safe and secure shopping experience[cite: 4].
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIPS.map((tip, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-xs font-bold text-[#3e9d24]">Tip #{idx + 1}</span>
              <h3 className="font-bold text-gray-900">{tip.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}