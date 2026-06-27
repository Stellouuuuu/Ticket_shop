export const TICKET_PRICE = 8000;
export const VIP_TICKET_PRICE = 30000;
export const CURRENCY = "FCFA";

export const TICKET_TYPES = ["standard", "vip"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const TICKET_PRICES: Record<TicketType, number> = {
  standard: TICKET_PRICE,
  vip: VIP_TICKET_PRICE,
};

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  standard: "Standard",
  vip: "VIP",
};

export const EVENT_NAME = "Festichill 6";
export const EVENT_THEME = "Las Favelas";
export const EVENT_DATES = "18 – 19 Juillet";
export const EVENT_LOCATION = "Cotonou";
export const SALE_END_DATE = "2026-07-18T08:00:00+01:00";

/** Urgency bar — places restantes cette semaine (statique pour l'instant) */
export const TICKETS_WEEKLY_TOTAL = 50;
export const TICKETS_WEEKLY_REMAINING = 42;

export const ORDER_STATUSES = [
  "pending",
  "contacted",
  "confirmed",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  contacted: "Contacté",
  confirmed: "Confirmée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const TEAM_MEMBERS = ["Axel", "Grâce", "Sonia", "Kevin"] as const;

export type TeamMember = (typeof TEAM_MEMBERS)[number];

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} ${CURRENCY}`;
}

export function getTicketPrice(type: TicketType): number {
  return TICKET_PRICES[type];
}

export function calculateTotal(
  ticketCount: number,
  ticketType: TicketType = "standard"
): number {
  return ticketCount * getTicketPrice(ticketType);
}

export function isValidTicketType(value: string): value is TicketType {
  return TICKET_TYPES.includes(value as TicketType);
}
