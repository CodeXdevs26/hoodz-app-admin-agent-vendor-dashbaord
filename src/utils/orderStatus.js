// Single source of truth for the vendor-driven order flow.
//
// pending → accepted → preparing → rider_assigned → out_for_delivery
//         → collected → on_the_way → delivered
// cancelled / rejected: admin/agent via PATCH /orders/:id/status from any active step.
//
// Legacy names are still sent by older records/backends:
//   confirmed = accepted, processing = preparing, picked_up = collected

export const LEGACY_STATUS = {
  confirmed: "accepted",
  processing: "preparing",
  picked_up: "collected",
};

export const normalizeStatus = (status) => LEGACY_STATUS[status] || status;

export const ORDER_FLOW = [
  "pending",
  "accepted",
  "preparing",
  "rider_assigned",
  "out_for_delivery",
  "collected",
  "on_the_way",
  "delivered",
];

export const TERMINAL_STATUSES = ["delivered", "cancelled", "rejected"];

/** Active = can still be cancelled/rejected by admin/agent. */
export const isActiveStatus = (status) =>
  !TERMINAL_STATUSES.includes(normalizeStatus(status));

export const STATUS_COLORS = {
  pending: "orange",
  accepted: "blue",
  preparing: "cyan",
  rider_assigned: "purple",
  out_for_delivery: "magenta",
  collected: "geekblue",
  on_the_way: "gold",
  delivered: "green",
  cancelled: "red",
  rejected: "volcano",
};

export const statusColor = (status) =>
  STATUS_COLORS[normalizeStatus(status)] || "default";

const DEFAULT_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  rider_assigned: "Rider assigned",
  out_for_delivery: "Out for delivery",
  collected: "Collected",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const LABEL_KEYS = {
  pending: "orders.statusPending",
  accepted: "orders.statusAccepted",
  preparing: "orders.statusPreparing",
  rider_assigned: "orders.statusRiderAssigned",
  out_for_delivery: "orders.statusOutForDelivery",
  collected: "orders.statusCollected",
  on_the_way: "orders.statusOnTheWay",
  delivered: "orders.statusDelivered",
  cancelled: "orders.statusCancelled",
  rejected: "orders.statusRejected",
};

/** Human label; pass the i18n `t` when available. */
export const statusLabel = (status, t) => {
  if (!status) return "N/A";
  const key = normalizeStatus(status);
  if (t && LABEL_KEYS[key]) return t(LABEL_KEYS[key]);
  return (
    DEFAULT_LABELS[key] ||
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

/** Options for an antd column `filters` (canonical values only). */
export const statusFilters = (t) =>
  [...ORDER_FLOW, "cancelled", "rejected"].map((s) => ({
    text: statusLabel(s, t),
    value: s,
  }));

/** antd onFilter that also matches legacy names. */
export const matchStatus = (value, record) =>
  normalizeStatus(record.status) === value;

/** Vendor actions allowed from a given status. */
export const vendorNextAction = (status) => {
  switch (normalizeStatus(status)) {
    case "pending":
      return "accept"; // PATCH /orders/:id/confirm
    case "accepted":
      return "preparing"; // PATCH /orders/:id/preparing → rider matching
    case "preparing":
    case "rider_assigned":
      return "out_for_delivery"; // PATCH /orders/:id/out-for-delivery
    default:
      return null;
  }
};

/**
 * Manual rider assign (socket job:assign) makes sense only from Preparing on:
 * auto matching starts at preparing, and nothing is offered before that.
 * The backend itself refuses only when the job is already accepted, picked
 * up, or on the way, so rider_assigned (job matching/assigned) can still be
 * replaced.
 */
export const canAssignRider = (status) =>
  ["preparing", "rider_assigned", "out_for_delivery"].includes(
    normalizeStatus(status),
  );

// Delivery progress (rider side): Assigned → Collected → On the way → Delivered
export const deliveryStep = (status) => {
  const s = normalizeStatus(status);
  if (s === "delivered") return 3;
  if (s === "on_the_way") return 2;
  if (s === "collected") return 1;
  return 0;
};
