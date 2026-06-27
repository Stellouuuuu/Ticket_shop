import SiteNav from "@/components/SiteNav";
import OrderForm from "@/components/OrderForm";
import BenefitCards from "@/components/BenefitCards";
import FaqAccordion from "@/components/FaqAccordion";
import {
  EVENT_DATES,
  EVENT_LOCATION,
  EVENT_THEME,
  TICKET_PRICE,
  VIP_TICKET_PRICE,
  formatPrice,
} from "@/lib/constants";

export default function TicketsPage() {
  return (
    <>
      <div className="top-bar">
        <SiteNav />
      </div>

      <main className="landing">
        {/* ── Produit + Commander ── */}
        <section id="produit" className="product-section">
          <div className="container-wide">
            <div className="product-section__grid">
              <div className="product-visual">
                <div className="product-visual__badge">Billeterie ouverte</div>
                <div className="product-visual__card">
                  <div className="product-visual__header">
                    <span className="product-visual__brand">FESTICHILL</span>
                    <span className="product-visual__edition">6</span>
                  </div>
                  <p className="product-visual__theme">{EVENT_THEME}</p>
                  <div className="product-visual__dates">{EVENT_DATES}</div>
                  <p className="product-visual__location">{EVENT_LOCATION}</p>
                  <div className="product-visual__prices">
                    <div className="product-visual__price product-visual__price--std">
                      <span>Standard</span>
                      <strong>{formatPrice(TICKET_PRICE)}</strong>
                    </div>
                    <div className="product-visual__price product-visual__price--vip">
                      <span>VIP</span>
                      <strong>{formatPrice(VIP_TICKET_PRICE)}</strong>
                    </div>
                  </div>
                </div>
                <p className="product-visual__tagline">
                  Réservez en ligne, payez à la livraison
                </p>
              </div>

              <div id="commander" className="product-checkout">
                <div className="card card--form">
                  <div className="product-checkout__header">
                    <span className="product-checkout__brand">FESTICHILL 6</span>
                    <h1 className="product-checkout__title">Réservez vos tickets</h1>
                    <p className="product-checkout__desc">
                      Choisissez votre formule, renseignez vos informations et
                      recevez vos tickets à domicile. Paiement uniquement à la
                      livraison.
                    </p>
                    <div className="info-banner">
                      <span className="info-banner__icon" aria-hidden="true">
                        i
                      </span>
                      <span>
                        NB — Commandez aujourd&apos;hui, livraison sous 24 à 48h
                        à Cotonou.
                      </span>
                    </div>
                  </div>
                  <OrderForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Avantages ── */}
        <section id="avantages" className="section section--soft">
          <div className="container-wide">
            <BenefitCards />
          </div>
        </section>

        {/* ── En savoir plus ── */}
        <section id="apropos" className="section">
          <div className="container-wide container-narrow">
            <div className="about-block">
              <h2 className="about-block__title">
                La solution qui vous simplifie la vie
              </h2>
              <p className="about-block__text">
                Plus besoin de vous déplacer ou d&apos;attendre en file. Réservez
                vos tickets Festichill 6 depuis chez vous en quelques clics. Notre
                équipe locale vous contacte, confirme votre commande et livre vos
                tickets directement à votre adresse à Cotonou.
              </p>
              <p className="about-block__text">
                Festichill 6 — Las Favelas, c&apos;est deux jours de musique,
                d&apos;ambiance et de chill à Cotonou. Standard ou VIP, choisissez
                l&apos;expérience qui vous correspond.
              </p>

              <div className="reasons-list">
                <h3 className="reasons-list__title">
                  5 raisons de réserver vos tickets Festichill 6 maintenant.
                </h3>
                <ul className="reasons-list__items">
                  <li className="reasons-list__item">
                    <span className="reasons-list__check" aria-hidden="true">✓</span>
                    <p>
                      <strong>Sans file d&apos;attente.</strong> Commande en 2
                      minutes depuis chez vous, sans stress ni attente.
                    </p>
                  </li>
                  <li className="reasons-list__item">
                    <span className="reasons-list__check" aria-hidden="true">✓</span>
                    <p>
                      <strong>Sans déplacement.</strong> Livraison à domicile à
                      Cotonou — nos livreurs viennent directement chez vous.
                    </p>
                  </li>
                  <li className="reasons-list__item">
                    <span className="reasons-list__check" aria-hidden="true">✓</span>
                    <p>
                      <strong>Sans paiement en ligne.</strong> Payez uniquement à
                      la livraison, en espèces ou Mobile Money.
                    </p>
                  </li>
                  <li className="reasons-list__item">
                    <span className="reasons-list__check" aria-hidden="true">✓</span>
                    <p>
                      <strong>Équipe locale joignable sur WhatsApp.</strong>{" "}
                      Confirmation rapide et suivi personnalisé de votre commande.
                    </p>
                  </li>
                  <li className="reasons-list__item">
                    <span className="reasons-list__check" aria-hidden="true">✓</span>
                    <p>
                      <strong>Places limitées.</strong> Ne ratez pas Festichill
                      6 — Las Favelas, les 18 et 19 juillet à Cotonou.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="section section--soft">
          <div className="container-wide container-narrow">
            <FaqAccordion />
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="section final-cta">
          <div className="container-wide container-narrow">
            <h2 className="final-cta__title">Ce week-end, vivez Festichill 6</h2>
            <p className="final-cta__subtitle">
              Sans file d&apos;attente. Sans déplacement. Sans compromis.
            </p>
            <a href="#commander" className="btn btn-primary btn-primary--pill">
              Réserver mes tickets
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
