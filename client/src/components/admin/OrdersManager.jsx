import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Modal,
  Spinner,
  btnGhost,
  btnPrimary,
  getErrorMessage,
  inputClass,
  labelClass,
  useToast,
} from "./ui";

const apiEndpoint = import.meta.env.VITE_API_URL";
const withCreds = { withCredentials: true };

const PAGE_SIZE = 25;

/* ---------- Statuses ---------- */

const STATUSES = [
  { id: "pending", label: "Pending", style: "bg-amber-100 text-amber-700" },
  { id: "confirmed", label: "Confirmed", style: "bg-blue-100 text-blue-700" },
  { id: "shipped", label: "Shipped", style: "bg-indigo-100 text-indigo-700" },
  {
    id: "delivered",
    label: "Delivered",
    style: "bg-emerald-100 text-emerald-700",
  },
  { id: "cancelled", label: "Cancelled", style: "bg-rose-100 text-rose-700" },
];
const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

// One-click "next step" shown in the table
const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "shipped",
  shipped: "delivered",
};

const normStatus = (s) => String(s || "pending").toLowerCase();

function StatusBadge({ status }) {
  const id = normStatus(status);
  const known = STATUS_BY_ID[id];
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
        known ? known.style : "bg-slate-100 text-slate-600"
      }`}
    >
      {known ? known.label : id}
    </span>
  );
}

/* ---------- Helpers ---------- */

const money = (v) => `Br ${Number(v).toLocaleString()}`;

const formatDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatDateTime = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

const customerLabel = (o) =>
  o.customer_name || o.customer_email || `User #${o.user_id}`;

async function putStatus(id, status) {
  const { data } = await axios.put(
    `${apiEndpoint}/admin/orders/${id}/status`,
    { status },
    withCreds,
  );
  return data;
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-14 rounded bg-slate-100" />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-3 w-40 rounded bg-slate-100" />
        </div>
      </td>
      <td className="hidden px-6 py-4 lg:table-cell">
        <div className="h-4 w-36 rounded bg-slate-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-16 rounded bg-slate-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </td>
      <td className="px-6 py-4">
        <div className="ml-auto h-6 w-28 rounded bg-slate-100" />
      </td>
    </tr>
  ));
}

/* ---------- Main component ---------- */

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [selectedId, setSelectedId] = useState(null);
  const [quickId, setQuickId] = useState(null);

  const [toastNode, notify] = useToast();

  const fetchOrders = useCallback(async (signal) => {
    setLoadError("");
    try {
      const { data } = await axios.get(`${apiEndpoint}/admin/orders`, {
        ...withCreds,
        signal,
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setLoadError(getErrorMessage(err, "Failed to load orders"));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [statusFilter, query]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const counts = useMemo(() => {
    const c = { all: orders.length };
    for (const o of orders) {
      const s = normStatus(o.status);
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return orders.filter((o) => {
      if (statusFilter !== "all" && normStatus(o.status) !== statusFilter)
        return false;
      if (!q) return true;
      return [
        String(o.id),
        o.customer_name,
        o.customer_email,
        o.shipping_phone,
        o.shipping_address,
      ].some((field) => field?.toLowerCase?.().includes(q));
    });
  }, [orders, statusFilter, query]);

  const shown = filtered.slice(0, visible);

  const applyStatus = useCallback((id, status, updatedAt) => {
    setOrders((prev) =>
      prev.map((o) =>
        String(o.id) === String(id)
          ? { ...o, status, updated_at: updatedAt ?? o.updated_at }
          : o,
      ),
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
          {!loading && !loadError && (
            <p className="text-sm text-slate-500">
              {filtered.length} {filtered.length === 1 ? "order" : "orders"}
              {filtered.length !== orders.length && ` of ${orders.length}`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className={btnGhost}
        >
          {refreshing && <Spinner className="mr-2 h-4 w-4" />}
          Refresh
        </button>
      </div>

      {/* Status tabs + search */}
      {orders.length > 0 && (
        <div className="space-y-3">
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            role="group"
            aria-label="Filter by status"
          >
            {[{ id: "all", label: "All" }, ...STATUSES].map((s) => {
              const active = statusFilter === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  aria-pressed={active}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] ${
                    active
                      ? "border-[#3e9d24] bg-[#3e9d24] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {s.label}
                  <span
                    className={`ml-1.5 text-xs ${active ? "text-white/80" : "text-slate-400"}`}
                  >
                    {counts[s.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="max-w-sm">
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <input
              id="order-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by #, name, email, phone, address…"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchOrders();
              }}
              className={btnGhost}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="hidden px-6 py-3 font-semibold lg:table-cell">
                    Ship to
                  </th>
                  <th className="px-6 py-3 font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <SkeletonRows />
                ) : shown.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-slate-400"
                    >
                      {orders.length === 0
                        ? "No orders yet."
                        : "No orders match your filters."}
                    </td>
                  </tr>
                ) : (
                  shown.map((order) => {
                    const next = NEXT_STATUS[normStatus(order.status)];
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-3">
                          <div className="font-semibold text-slate-900">
                            #{order.id}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDate(order.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="max-w-[14rem] truncate font-medium text-slate-800">
                            {customerLabel(order)}
                          </div>
                          {order.customer_email && order.customer_name && (
                            <div className="max-w-[14rem] truncate text-xs text-slate-500">
                              {order.customer_email}
                            </div>
                          )}
                        </td>
                        <td className="hidden px-6 py-3 lg:table-cell">
                          <div className="max-w-[16rem] truncate text-slate-800">
                            {order.shipping_address}
                          </div>
                          <div className="text-xs text-slate-500">
                            {order.shipping_phone}
                          </div>
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-900">
                          {money(order.total_amount)}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedId(order.id)}
                            aria-label={`View details for order ${order.id}`}
                            className="rounded-lg bg-green-50 px-3 py-1 font-semibold text-[#2f7d1b] transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24]"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > shown.length && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className={btnGhost}
          >
            Show more ({filtered.length - shown.length} left)
          </button>
        </div>
      )}

      {selectedId && (
        <OrderDetailsModal
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChanged={applyStatus}
          notify={notify}
        />
      )}

      {toastNode}
    </div>
  );
}

/* ---------- Details modal ---------- */

function OrderDetailsModal({ orderId, onClose, onStatusChanged, notify }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [target, setTarget] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { data } = await axios.get(
          `${apiEndpoint}/admin/orders/${orderId}`,
          { ...withCreds, signal: controller.signal },
        );
        setOrder(data);
        setTarget(normStatus(data.status));
      } catch (err) {
        if (axios.isCancel(err)) return;
        setLoadError(getErrorMessage(err, "Could not load order"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [orderId]);

  const current = order ? normStatus(order.status) : "";
  const locked = current === "cancelled";
  const unchanged = target === current;

  const handleUpdate = async () => {
    if (unchanged || saving) return;

    // Cancelling returns stock and can't be undone, so ask first
    if (target === "cancelled" && !confirmCancel) {
      setConfirmCancel(true);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await putStatus(order.id, target);
      const status = updated?.status ?? target;
      const updatedAt = updated?.updated_at;
      setOrder((o) => ({
        ...o,
        status,
        updated_at: updatedAt ?? o.updated_at,
      }));
      setTarget(normStatus(status));
      onStatusChanged(order.id, status, updatedAt);
      notify(`Order #${order.id} is now ${status}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update status"));
    } finally {
      setConfirmCancel(false);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Order #${orderId}`}
      onClose={onClose}
      busy={saving}
      maxWidth="max-w-lg"
    >
      <div className="p-6">
        {loading ? (
          <p className="animate-pulse py-10 text-center text-slate-400">
            Loading order…
          </p>
        ) : loadError || !order ? (
          <p className="py-10 text-center text-sm text-rose-600">
            {loadError || "Could not load order."}
          </p>
        ) : (
          <div className="space-y-6">
            <p className="-mt-1 text-xs text-slate-500">
              Placed {formatDateTime(order.created_at)}
            </p>

            {/* Status */}
            <section className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  Status
                </span>
                <StatusBadge status={order.status} />
              </div>

              {locked ? (
                <p className="text-xs text-slate-500">
                  Cancelled orders can't be changed.
                </p>
              ) : (
                <>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label htmlFor="order-status" className={labelClass}>
                        Change status
                      </label>
                      <select
                        id="order-status"
                        value={target}
                        disabled={saving}
                        onChange={(e) => {
                          setTarget(e.target.value);
                          setConfirmCancel(false);
                          setError("");
                        }}
                        className={inputClass}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                        {!STATUS_BY_ID[current] && (
                          <option value={current} disabled>
                            {current}
                          </option>
                        )}
                      </select>
                    </div>
                    {!confirmCancel && (
                      <button
                        type="button"
                        onClick={handleUpdate}
                        disabled={unchanged || saving}
                        className={btnPrimary}
                      >
                        {saving && <Spinner />}
                        Update
                      </button>
                    )}
                  </div>

                  {confirmCancel && (
                    <div
                      role="alert"
                      className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-3"
                    >
                      <p className="text-sm text-rose-800">
                        Cancel this order? The items go back into stock, and a
                        cancelled order can't be reopened.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleUpdate}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                        >
                          {saving && <Spinner />}
                          Yes, cancel order
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmCancel(false);
                            setTarget(current);
                          }}
                          disabled={saving}
                          className={btnGhost}
                        >
                          Keep order
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <p role="alert" className="text-sm text-rose-600">
                      {error}
                    </p>
                  )}
                </>
              )}
            </section>

            {/* Customer */}
            <section className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <Row label="Customer" value={customerLabel(order)} />
              {order.customer_email && (
                <Row
                  label="Email"
                  value={
                    <a
                      href={`mailto:${order.customer_email}`}
                      className="text-[#2f7d1b] hover:underline"
                    >
                      {order.customer_email}
                    </a>
                  }
                />
              )}
              {order.shipping_phone && (
                <Row
                  label="Phone"
                  value={
                    <a
                      href={`tel:${order.shipping_phone}`}
                      className="text-[#2f7d1b] hover:underline"
                    >
                      {order.shipping_phone}
                    </a>
                  }
                />
              )}
              <Row label="Address" value={order.shipping_address} />
            </section>

            {/* Items */}
            <section>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Items
              </h4>
              <div className="space-y-2">
                {order.items?.length ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Qty {item.quantity} &times; {money(item.price)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-slate-900">
                        {money(item.subtotal)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No items found.</p>
                )}
              </div>
            </section>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="font-medium text-slate-600">Total</span>
              <span className="text-2xl font-black text-[#3e9d24]">
                {money(order.total_amount)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 font-medium text-slate-500">{label}</span>
      <span className="break-words text-right font-semibold text-slate-900">
        {value || "—"}
      </span>
    </div>
  );
}
