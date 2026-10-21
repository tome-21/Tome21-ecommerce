import { useCallback, useEffect, useId, useRef, useState } from "react";

/* ---------- Shared styles ---------- */

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#e11d2e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b5121f] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d2e] focus-visible:ring-offset-2";

export const btnGhost =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#e11d2e] focus:ring-2 focus:ring-[#e11d2e]/30";

export const labelClass =
  "mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500";

/* ---------- Helpers ---------- */

export function getErrorMessage(err, fallback = "Something went wrong") {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    (err?.code === "ERR_NETWORK" ? "Can't reach the server" : null) ||
    fallback
  );
}

export function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg
      className={`${className} animate-spin`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 018-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  title,
  onClose,
  children,
  maxWidth = "max-w-sm",
  busy = false,
}) {
  const titleId = useId();

  // Escape closes, background scroll locked while open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl bg-white shadow-xl`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 id={titleId} className="font-bold text-slate-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d2e]"
          >
            &times;
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Confirm dialog ---------- */

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel} busy={busy}>
      <div className="space-y-5 p-6">
        <p className="text-sm leading-relaxed text-slate-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            autoFocus
            className={btnGhost}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={btnDanger}
          >
            {busy && <Spinner />}
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Toast ---------- */

/**
 * const [toastNode, notify] = useToast();
 * notify("Saved"); notify("Failed", "error");
 * Render {toastNode} anywhere in your component.
 */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const notify = useCallback((message, type = "success") => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const node = toast ? (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`fixed bottom-4 right-4 z-[80] max-w-sm rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        toast.type === "error" ? "bg-rose-600" : "bg-slate-900"
      }`}
    >
      {toast.message}
    </div>
  ) : null;

  return [node, notify];
}
