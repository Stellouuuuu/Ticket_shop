const BENEFITS = [
  {
    icon: "🎫",
    title: "Livraison à domicile",
    text: "Recevez vos tickets directement chez vous à Cotonou, sans vous déplacer.",
  },
  {
    icon: "💰",
    title: "Paiement à la livraison",
    text: "Aucun paiement en ligne. Payez uniquement quand vous recevez vos tickets.",
  },
  {
    icon: "💬",
    title: "Équipe locale WhatsApp",
    text: "Notre équipe vous contacte rapidement pour confirmer et organiser la livraison.",
  },
] as const;

export default function BenefitCards() {
  return (
    <div className="benefits">
      <h2 className="benefits__title">Pourquoi réserver avec nous ?</h2>
      <div className="benefits__grid">
        {BENEFITS.map((b) => (
          <article key={b.title} className="benefit-card">
            <div className="benefit-card__icon" aria-hidden="true">
              {b.icon}
            </div>
            <h3 className="benefit-card__title">{b.title}</h3>
            <p className="benefit-card__text">{b.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
