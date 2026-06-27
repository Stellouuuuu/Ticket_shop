"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne la réservation ?",
    a: "Choisissez votre type de ticket (Standard ou VIP), renseignez vos informations et validez. Notre équipe vous contacte sous 24h pour confirmer et organiser la livraison à domicile à Cotonou.",
  },
  {
    q: "Quand et comment payer ?",
    a: "Aucun paiement en ligne. Vous payez uniquement à la livraison, en espèces ou par Mobile Money, directement à notre livreur. Le montant exact vous est confirmé par téléphone ou WhatsApp.",
  },
  {
    q: "Où se déroule Festichill 6 ?",
    a: "Festichill 6 — Las Favelas se tient à Cotonou les 18 et 19 juillet. Les tickets livrés vous donnent accès à l'événement selon le type choisi (Standard ou VIP).",
  },
  {
    q: "Quelle est la différence Standard vs VIP ?",
    a: "Le ticket Standard (8 000 FCFA) donne accès à l'événement. Le ticket VIP (30 000 FCFA) inclut des avantages exclusifs : accès prioritaire, espace VIP et expérience premium.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "La livraison à domicile à Cotonou se fait généralement sous 24 à 48h après confirmation de votre commande. Notre équipe vous contacte pour convenir d'un créneau.",
  },
  {
    q: "Puis-je annuler ma commande ?",
    a: "Oui, tant que la livraison n'a pas eu lieu. Contactez-nous par WhatsApp au +229 93 88 14 74 ou au 50 03 76 18 pour annuler ou modifier votre commande.",
  },
] as const;

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="faq">
      <h2 className="faq__title">Vos questions, nos réponses</h2>
      <div className="faq__list">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              className={`faq__item ${isOpen ? "faq__item--open" : ""}`}
            >
              <button
                type="button"
                className="faq__question"
                aria-expanded={isOpen}
                onClick={() => toggle(i)}
              >
                <span>{item.q}</span>
                <span className="faq__icon" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="faq__answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
