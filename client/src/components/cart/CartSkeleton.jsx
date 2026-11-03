import Header from "../Header";
import Footer from "../Footer";

export default function CartSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6">
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-80 bg-gray-200 rounded-2xl" />
        </div>
      </main>
      <Footer />
    </div>
  );
}