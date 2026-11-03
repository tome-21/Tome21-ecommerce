import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-xs space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            At Tome21 Store, we respect your privacy and protect your personal information. We collect information such as your name, contact details, payment confirmation, and delivery address strictly as necessary to process orders, arrange delivery, and provide customer support[cite: 7].
          </p>
          <div className="p-4 rounded-xl bg-green-50/50 border border-green-100 text-xs text-[#2f7d1b]">
            Your personal data is handled securely and is never shared outside of authorized fulfillment providers needed to complete your delivery[cite: 7].
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}