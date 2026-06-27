import Header from "@/components/Header";
import { getOrderByReference } from "@/lib/db";
import { formatPrice, STATUS_LABELS, TICKET_TYPE_LABELS } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ reference: string }>;
}

export default async function MerciPage({ params }: Props) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);

  if (!order) {
    notFound();
  }

  const statusClass = `status-badge status-${order.status}`;

  return (
    <>
      <Header />
      <main className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="success-icon">✓</div>
          <h1>Réservation confirmée !</h1>
          <p className="subtitle">
            Votre demande a bien été enregistrée. Notre équipe vous contactera
            très bientôt pour finaliser la livraison.
          </p>

          <div className="order-detail" style={{ textAlign: "left" }}>
            <div className="order-detail-row">
              <span className="label">Référence</span>
              <span className="value ref-cell">{order.reference}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Nom</span>
              <span className="value">{order.full_name}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Type</span>
              <span className="value">{TICKET_TYPE_LABELS[order.ticket_type]}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Tickets</span>
              <span className="value">{order.ticket_count}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Prix unitaire</span>
              <span className="value">{formatPrice(order.unit_price)}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Total</span>
              <span className="value" style={{ color: "var(--favela-orange)" }}>
                {formatPrice(order.total_amount)}
              </span>
            </div>
            <div className="order-detail-row">
              <span className="label">Statut</span>
              <span className="value">
                <span className={statusClass}>
                  {STATUS_LABELS[order.status]}
                </span>
              </span>
            </div>
          </div>

          <div className="reminder-box" style={{ textAlign: "left" }}>
            <p>
              <strong>Prochaines étapes :</strong>
            </p>
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem" }}>
              <li>
                Un membre de notre équipe vous contactera par appel ou WhatsApp.
              </li>
              <li>
                Nous confirmerons ensemble le nombre de tickets et la livraison.
              </li>
              <li>
                Le paiement se fera <strong>uniquement à la livraison</strong>{" "}
                de vos tickets.
              </li>
            </ul>
          </div>

          <p style={{ marginTop: "1.5rem" }}>
            <Link href="/tickets" className="btn btn-secondary">
              Nouvelle réservation
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
