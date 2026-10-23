import { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const apiEndpoint = import.meta.env.VITE_API_URL;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3e9d24]";

const fieldRing =
  "focus:outline-none focus:border-[#3e9d24] focus:ring-2 focus:ring-[#3e9d24]/25";

// Quick-fill suggestions for the subject field
const SUGGESTIONS = ["Question about an order", "Product question", "Feedback"];

const Icon = ({ children, className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CONTACTS = [
  {
    label: "Email",
    value: "tome2100000@gmail.com",
    href: "mailto:tome2100000@gmail.com",
    icon: (
      <>
        <path d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
      </>
    ),
  },
  {
    label: "Call",
    value: "+251 973 048 752",
    href: "tel:+251973048752",
    icon: (
      <path d="M3 5a2 2 0 012-2h3.3a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.5 5.5l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
    ),
  },
  {
    label: "Open",
    value: "Mon – Sat, 8am – 6pm",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post(
        `${apiEndpoint}/contact`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
        { withCredentials: true },
      );
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const reset = () => {
    setForm({ name: "", email: "", subject: "", message: "" });
    setStatus("idle");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:py-14">
        <div className="grid md:grid-cols-5 rounded-3xl overflow-hidden shadow-xl bg-white">
          {/* Left: brand panel */}
          <section className="relative md:col-span-2 bg-[#3e9d24] text-white p-8 sm:p-10 overflow-hidden">
            {/* decorative shapes */}
            <div
              aria-hidden="true"
              className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-yellow-300/90"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-[#3e9d24]"
            />

            <div className="relative">
              <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight leading-none">
                Say hi
              </h1>
              <p className="mt-4 text-white/85 text-sm leading-relaxed max-w-xs">
                Question, feedback or a missing order? Drop us a line and we
                will get back within a day.
              </p>

              <ul className="mt-8 space-y-4">
                {CONTACTS.map((c) => {
                  const body = (
                    <>
                      <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white/15 group-hover:bg-white/25 transition-colors">
                        <Icon>{c.icon}</Icon>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] uppercase tracking-wider text-white/70">
                          {c.label}
                        </span>
                        <span className="block text-sm font-semibold truncate">
                          {c.value}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={c.label}>
                      {c.href ? (
                        <a
                          href={c.href}
                          className={`group flex items-center gap-3 rounded-xl ${focusRing}`}
                        >
                          {body}
                        </a>
                      ) : (
                        <div className="group flex items-center gap-3">
                          {body}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* Right: form */}
          <section className="md:col-span-3 p-8 sm:p-10">
            {status === "sent" ? (
              <div
                role="status"
                className="h-full min-h-[22rem] flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-yellow-300 text-slate-900 flex items-center justify-center">
                  <Icon className="w-8 h-8">
                    <path d="M5 13l4 4L19 7" />
                  </Icon>
                </div>
                <h2 className="mt-5 text-2xl font-black text-slate-900">
                  Message sent!
                </h2>
                <p className="mt-2 text-sm text-slate-500 max-w-xs">
                  Thanks, {form.name.split(" ")[0] || "friend"}. We'll reply to{" "}
                  <span className="font-semibold text-slate-700">
                    {form.email}
                  </span>{" "}
                  soon.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-6 px-5 py-2.5 rounded-lg bg-[#3e9d24] hover:bg-[#368a1f] text-white text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="c-name"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Name
                    </label>
                    <input
                      id="c-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Your name"
                      className={`mt-1.5 w-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-lg ${fieldRing}`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="c-email"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Email
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@email.com"
                      className={`mt-1.5 w-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-lg ${fieldRing}`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="c-subject"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Subject
                  </label>
                  <input
                    id="c-subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={update("subject")}
                    placeholder="What's this about?"
                    className={`mt-1.5 w-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-lg ${fieldRing}`}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, subject: s }))}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 ${
                          form.subject === s
                            ? "bg-[#3e9d24] border-[#3e9d24] text-white"
                            : "border-slate-200 text-slate-600 hover:border-[#3e9d24]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="c-message"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="c-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="How can we help?"
                    className={`mt-1.5 w-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-lg resize-none ${fieldRing}`}
                  />
                </div>

                {status === "error" && (
                  <p role="alert" className="text-sm text-red-600">
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-slate-900 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2"
                >
                  {status === "sending" ? "Sending…" : "Send message"}
                  <Icon className="w-4 h-4">
                    <path d="M5 12h14m-6-6l6 6-6 6" />
                  </Icon>
                </button>
              </form>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
