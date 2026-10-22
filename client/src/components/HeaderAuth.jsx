import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Login from "./Login";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3e9d24]";

function Avatar({ user, className = "h-8 w-8" }) {
  const [failed, setFailed] = useState(false);
  const initial = (user.name || user.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  if (!user.image_url || failed) {
    return (
      <span
        className={`${className} shrink-0 rounded-full bg-yellow-400 text-slate-900 font-bold flex items-center justify-center text-sm`}
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={user.image_url}
      alt=""
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-full object-cover bg-white`}
    />
  );
}

export default function HeaderAuth() {
  // `logout` is optional: if your hook doesn't expose it, the menu hides "Log out"
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close when the page changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (loading) {
    return (
      <div className="h-9 w-9 sm:w-28 animate-pulse rounded-full bg-white/20" />
    );
  }

  if (!user) return <Login />;

  const isAdmin = user.role === "admin";

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name || "your account"}`}
        className={`flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 p-1 sm:pr-3 transition-colors ${focusRing}`}
      >
        <Avatar user={user} />
        <span className="hidden sm:block max-w-[7.5rem] truncate text-sm font-semibold text-white">
          {user.name}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hidden sm:block w-4 h-4 text-white/80 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl bg-white text-gray-800 shadow-xl ring-1 ring-black/5 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Avatar user={user} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user.name}
              </p>
              {user.email && (
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              )}
            </div>
          </div>

          <div className="py-1">
            {isAdmin && (
              <Link
                to="/admin"
                role="menuitem"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#2f7d1b] hover:bg-green-50 focus-visible:outline-none focus-visible:bg-green-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />
                </svg>
                Admin dashboard
              </Link>
            )}
            <Link
              to="/orders"
              role="menuitem"
              className="block px-4 py-2.5 text-sm hover:bg-green-50 hover:text-[#2f7d1b] focus-visible:outline-none focus-visible:bg-green-50"
            >
              My orders
            </Link>
            <Link
              to="/cart"
              role="menuitem"
              className="block px-4 py-2.5 text-sm hover:bg-green-50 hover:text-[#2f7d1b] focus-visible:outline-none focus-visible:bg-green-50"
            >
              My cart
            </Link>
          </div>

          {typeof logout === "function" && (
            <div className="border-t border-gray-100 py-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:bg-red-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}