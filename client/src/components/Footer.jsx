import { Link } from "react-router-dom";

/* Edit links and contact details here. Change the `to` paths to match your routes. */
const SUPPORT_EMAIL = "tome2100000@gmail.com";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/products" },
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
  "inline-block rounded text-gray-600 hover:text-[#2f7d1b] hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link
            to="/"
            className="inline-block text-2xl font-extrabold tracking-tight text-[#3e9d24] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2"
            aria-label="Tome21 home"
          >
            Tome<span className="text-yellow-400">21</span>
          </Link>
          <p className="mt-3 text-gray-500 max-w-xs">
            Quality products delivered to your door in Ethiopia.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className={`mt-4 font-medium ${linkClass}`}
          >
            {SUPPORT_EMAIL}
          </a>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h4 className="font-bold text-gray-900 mb-3">{col.title}</h4>
            <ul className="space-y-2.5">
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

      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-1 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Tome21. All rights reserved.</p>
          <p>Made in Addis Ababa</p>
        </div>
      </div>
    </footer>
  );
}
