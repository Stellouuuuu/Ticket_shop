"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TICKET_PRICES,
  TICKET_TYPE_LABELS,
  TICKET_TYPES,
  calculateTotal,
  formatPrice,
  getTicketPrice,
  type TicketType,
} from "@/lib/constants";

const MIN_TICKETS = 1;
const MAX_TICKETS = 50;

const STEPS = [
  { id: 1, label: "Tickets" },
  { id: 2, label: "Informations" },
  { id: 3, label: "Confirmation" },
] as const;

export default function OrderForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [ticketType, setTicketType] = useState<TicketType>("standard");
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const unitPrice = getTicketPrice(ticketType);
  const total = calculateTotal(ticketCount, ticketType);

  function clampCount(value: number): number {
    if (Number.isNaN(value)) return MIN_TICKETS;
    return Math.min(MAX_TICKETS, Math.max(MIN_TICKETS, Math.floor(value)));
  }

  function handleCountChange(raw: string) {
    if (raw === "") {
      setTicketCount(MIN_TICKETS);
      return;
    }
    setTicketCount(clampCount(Number(raw)));
  }

  function adjustCount(delta: number) {
    setTicketCount((prev) => clampCount(prev + delta));
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (ticketCount < MIN_TICKETS || ticketCount > MAX_TICKETS) {
        return `Le nombre de tickets doit être entre ${MIN_TICKETS} et ${MAX_TICKETS}.`;
      }
    }
    if (current === 2) {
      if (!fullName.trim()) return "Le nom complet est requis.";
      if (!phone.trim()) return "Le téléphone est requis.";
      if (!email.trim()) return "L'email est requis.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return "Adresse email invalide.";
      }
      if (!deliveryZone.trim()) return "La zone de livraison est requise.";
    }
    return null;
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const err = validateStep(2);
    if (err) {
      setError(err);
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          delivery_zone: deliveryZone.trim(),
          ticket_type: ticketType,
          ticket_count: ticketCount,
          customer_note: customerNote.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      router.push(`/merci/${data.reference}`);
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-wizard">
      <div className="form-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
        {STEPS.map((s) => (
          <div key={s.id} className="form-progress__step">
            <div
              className={`form-progress__segment ${
                s.id < step ? "form-progress__segment--done" : ""
              } ${s.id === step ? "form-progress__segment--active" : ""}`}
            />
            <span
              className={`form-progress__label ${
                s.id === step ? "form-progress__label--active" : ""
              } ${s.id < step ? "form-progress__label--done" : ""}`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {step === 1 && (
        <div className="form-wizard__panel">
          <h2 className="form-wizard__title">Choisissez vos tickets</h2>
          <p className="form-wizard__subtitle">
            Sélectionnez le type de ticket et le nombre de places souhaité.
            Le total se calcule automatiquement.
          </p>

          <div className="form-group">
            <label>Type de ticket *</label>
            <div className="ticket-type-picker">
              {TICKET_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`ticket-type-option ticket-type-option--${type} ${
                    ticketType === type ? "ticket-type-option--selected" : ""
                  }`}
                  onClick={() => setTicketType(type)}
                  aria-pressed={ticketType === type}
                >
                  <span className="ticket-type-option__label">
                    {TICKET_TYPE_LABELS[type]}
                  </span>
                  <span className="ticket-type-option__price">
                    {formatPrice(TICKET_PRICES[type])}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ticket_count">Nombre de tickets *</label>
            <div className="ticket-input-row">
              <button
                type="button"
                className="ticket-btn"
                onClick={() => adjustCount(-1)}
                disabled={ticketCount <= MIN_TICKETS}
                aria-label="Retirer un ticket"
              >
                −
              </button>
              <input
                id="ticket_count"
                type="number"
                min={MIN_TICKETS}
                max={MAX_TICKETS}
                value={ticketCount}
                onChange={(e) => handleCountChange(e.target.value)}
              />
              <button
                type="button"
                className="ticket-btn"
                onClick={() => adjustCount(1)}
                disabled={ticketCount >= MAX_TICKETS}
                aria-label="Ajouter un ticket"
              >
                +
              </button>
            </div>
          </div>

          <div className="total-display">
            <div className="detail">Total à payer à la livraison</div>
            <div className="amount">{formatPrice(total)}</div>
            <div className="detail">
              {ticketCount} × {TICKET_TYPE_LABELS[ticketType]} ({formatPrice(unitPrice)})
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-wizard__panel">
          <h2 className="form-wizard__title">Vos informations</h2>
          <p className="form-wizard__subtitle">
            Renseignez vos coordonnées pour que notre équipe puisse vous
            contacter et organiser la livraison.
          </p>

          <div className="form-group">
            <label htmlFor="full_name">Nom complet *</label>
            <input
              id="full_name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex : Jean Dupont"
              autoComplete="name"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="phone">Téléphone / WhatsApp *</label>
              <div className="form-input-icon">
                <span className="form-input-icon__icon" aria-hidden="true">📱</span>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+229 97 00 00 00"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <div className="form-input-icon">
                <span className="form-input-icon__icon" aria-hidden="true">✉</span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@email.com"
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="delivery_zone">Quartier / zone de livraison *</label>
            <div className="form-input-icon">
              <span className="form-input-icon__icon" aria-hidden="true">📍</span>
              <input
                id="delivery_zone"
                type="text"
                required
                value={deliveryZone}
                onChange={(e) => setDeliveryZone(e.target.value)}
                placeholder="Fidjrossè, Akpakpa, Cadjehoun..."
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-wizard__panel">
          <h2 className="form-wizard__title">Confirmer la réservation</h2>
          <p className="form-wizard__subtitle">
            Vérifiez votre commande avant de l&apos;envoyer. Paiement uniquement
            à la livraison.
          </p>

          <div className="form-recap">
            <div className="form-recap__row">
              <span>Nom</span>
              <strong>{fullName}</strong>
            </div>
            <div className="form-recap__row">
              <span>Téléphone</span>
              <strong>{phone}</strong>
            </div>
            <div className="form-recap__row">
              <span>Email</span>
              <strong>{email}</strong>
            </div>
            <div className="form-recap__row">
              <span>Zone</span>
              <strong>{deliveryZone}</strong>
            </div>
            <div className="form-recap__row">
              <span>Type</span>
              <strong>{TICKET_TYPE_LABELS[ticketType]}</strong>
            </div>
            <div className="form-recap__row">
              <span>Tickets</span>
              <strong>{ticketCount}</strong>
            </div>
            <div className="form-recap__row form-recap__row--total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="customer_note">Remarque éventuelle</label>
            <textarea
              id="customer_note"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Ex : Je préfère être contacté sur WhatsApp après 18h"
            />
          </div>
        </div>
      )}

      <div className="form-actions">
        {step > 1 ? (
          <button type="button" className="btn btn-ghost" onClick={goBack}>
            Retour
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button type="button" className="btn btn-primary btn-primary--wizard btn-primary--pill" onClick={goNext}>
            Continuer
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-primary--wizard btn-primary--pill"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Envoi en cours..." : "Réserver mes tickets"}
          </button>
        )}
      </div>
    </div>
  );
}
