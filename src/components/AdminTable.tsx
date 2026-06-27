"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  TEAM_MEMBERS,
  formatPrice,
  type OrderStatus,
  type TeamMember,
  TICKET_TYPE_LABELS,
  type TicketType,
} from "@/lib/constants";

interface Order {
  id: number;
  reference: string;
  full_name: string;
  phone: string;
  email: string;
  delivery_zone: string;
  ticket_type: TicketType;
  ticket_count: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
  assigned_to: TeamMember | null;
  delivery_date: string | null;
  internal_note: string | null;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminTableProps {
  token: string;
  onLogout: () => void;
}

export default function AdminTable({ token, onLogout }: AdminTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [newAlert, setNewAlert] = useState<string | null>(null);
  const lastPendingCount = useRef<number | null>(null);

  const loadOrders = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const res = await fetch("/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          onLogout();
          return;
        }
        if (!res.ok) throw new Error();
        const data: Order[] = await res.json();
        setOrders(data);

        const pending = data.filter((o) => o.status === "pending").length;
        if (
          silent &&
          lastPendingCount.current !== null &&
          pending > lastPendingCount.current
        ) {
          const diff = pending - lastPendingCount.current;
          setNewAlert(
            diff === 1
              ? "1 nouvelle commande en attente"
              : `${diff} nouvelles commandes en attente`
          );
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Festichill — Nouvelle commande", {
              body: `${diff} nouvelle(s) commande(s) à traiter`,
              icon: "/icon.svg",
            });
          }
        }
        lastPendingCount.current = pending;
      } catch {
        if (!silent) setError("Impossible de charger les commandes.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, onLogout]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const interval = setInterval(() => loadOrders(true), 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  function enableBrowserNotifications() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission();
  }

  async function updateField(
    id: number,
    field: string,
    value: string | null
  ) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      if (!res.ok) throw new Error();

      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? updated : o))
      );
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSavingId(null);
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    tickets: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.ticket_count, 0),
    revenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.total_amount, 0),
  };

  function toDateInputValue(value: string | Date | null): string {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  }

  function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>;
  }

  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0, color: "var(--favela-green)" }}>
          Suivi des commandes
        </h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {newAlert && (
        <div className="admin-alert">
          <span>🔔 {newAlert}</span>
          <button
            type="button"
            className="admin-alert__dismiss"
            onClick={() => setNewAlert(null)}
          >
            OK
          </button>
        </div>
      )}

      {typeof Notification !== "undefined" &&
        Notification.permission === "default" && (
          <div className="admin-notify-prompt">
            <p>
              Recevez une alerte navigateur quand une nouvelle commande arrive
              (l&apos;équipe peut aussi consulter cette page).
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "auto", fontSize: "0.85rem" }}
              onClick={enableBrowserNotifications}
            >
              Activer les notifications
            </button>
          </div>
        )}

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Commandes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.tickets}</div>
          <div className="stat-label">Tickets réservés</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatPrice(stats.revenue)}</div>
          <div className="stat-label">Encaissé</div>
        </div>
      </div>

      <p className="admin-table-scroll-hint">
        Faites défiler horizontalement pour voir toutes les colonnes →
      </p>
      <div className="admin-table-wrap" role="region" aria-label="Tableau des commandes — défilement horizontal disponible">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Réf.</th>
              <th>Nom</th>
              <th>Tél.</th>
              <th>Email</th>
              <th>Quartier</th>
              <th>Type</th>
              <th>Tickets</th>
              <th>P.U.</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Responsable</th>
              <th>Livraison</th>
              <th>Note interne</th>
              <th>Remarque client</th>
              <th>Créée le</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={15} style={{ textAlign: "center", padding: "2rem" }}>
                  Aucune commande pour le moment.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className={
                    order.status === "pending"
                      ? "admin-table__row--pending"
                      : undefined
                  }
                >
                  <td className="ref-cell">{order.reference}</td>
                  <td>{order.full_name}</td>
                  <td>
                    <a href={`tel:${order.phone}`}>{order.phone}</a>
                  </td>
                  <td>
                    <a href={`mailto:${order.email}`}>{order.email}</a>
                  </td>
                  <td>{order.delivery_zone}</td>
                  <td>{TICKET_TYPE_LABELS[order.ticket_type] ?? order.ticket_type}</td>
                  <td>{order.ticket_count}</td>
                  <td>{formatPrice(order.unit_price)}</td>
                  <td>
                    <strong>{formatPrice(order.total_amount)}</strong>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateField(order.id, "status", e.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    {savingId === order.id && (
                      <div className="saving-indicator">Sauvegarde...</div>
                    )}
                  </td>
                  <td>
                    <select
                      value={order.assigned_to || ""}
                      onChange={(e) =>
                        updateField(
                          order.id,
                          "assigned_to",
                          e.target.value || null
                        )
                      }
                    >
                      <option value="">—</option>
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={toDateInputValue(order.delivery_date)}
                      onChange={(e) =>
                        updateField(
                          order.id,
                          "delivery_date",
                          e.target.value || null
                        )
                      }
                    />
                  </td>
                  <td>
                    <textarea
                      defaultValue={order.internal_note || ""}
                      onBlur={(e) => {
                        const val = e.target.value.trim() || null;
                        if (val !== (order.internal_note || null)) {
                          updateField(order.id, "internal_note", val);
                        }
                      }}
                      placeholder="Note interne..."
                    />
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--festi-muted)" }}>
                    {order.customer_note || "—"}
                  </td>
                  <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                    {formatDateTime(order.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
