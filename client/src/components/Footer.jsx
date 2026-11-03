import { Link } from "react-router-dom";

const SUPPORT_EMAIL = "tome2100000@gmail.com";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/products" },
      { label: "Traditional Fashion", to: "/products?category=traditional" },
      { label: "Modern Fashion", to: "/products?category=modern" },
      { label: "Custom Anime Hoodies", to: "/products?category=anime" },
      { label: "My orders", to: "/orders" },
      { label: "Cart", to: "/cart" },
    ],
  },
  {
    title: "About us",
    links: [
      { label: "About Tome21", to: "/about" },
      { label: "Terms and conditions", to: "/terms" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Billing policy", to: "/billing" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Safety tips", to: "/safety" },
    ],
  },
];

const linkClass =
  "inline-block rounded text-gray-500 hover:text-[#2f7d1b] hover:translate-x-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16 text-sm text-gray-600">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-12 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand & Mission Column (Span 2) */}
        <div className="md:col-span-2 space-y-4">
          <Link
            to="/"
            className="inline-block text-3xl font-black tracking-tight text-[#3e9d24] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2"
            aria-label="Tome21 home"
          >
            Tome<span className="text-yellow-400">21</span>
          </Link>

          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Your Tradition. Your Style. Your Choice. Bringing you beautiful
            traditional Ethiopian fashion, modern styles, and custom anime
            hoodies with reliable service.
          </p>

          <div className="pt-2">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Direct Support
            </span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-gray-800 font-semibold hover:text-[#2f7d1b] transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 text-[#3e9d24]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        {/* Dynamic Link Columns (Span 3) */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Tome21 Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Verified Payments (CBE & Telebirr)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
