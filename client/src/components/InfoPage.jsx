import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export const SUPPORT_EMAIL = "tome2100000@gmail.com";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2";

/** Shared shell for every footer page: header, title, content, help box, footer. */
export function InfoPage({ title, intro, updated, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} | Tome21`;
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
          <Link
            to="/"
            className={`rounded hover:text-[#2f7d1b] hover:underline ${focusRing}`}
          >
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-gray-700">{title}</span>
        </nav>

        <article className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-8 sm:px-10 sm:py-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {title}
          </h1>
          {updated && (
            <p className="text-xs text-gray-400 mt-2">Effective {updated}</p>
          )}
          {intro && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {intro}
            </p>
          )}
          <div className="mt-2">{children}</div>
        </article>

        <div className="mt-6 rounded-2xl bg-green-50 border border-green-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-gray-700">
            Questions? We're happy to help before you order.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className={`text-sm font-semibold text-[#2f7d1b] hover:underline rounded ${focusRing}`}
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export function Bullets({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-2 marker:text-[#3e9d24]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
