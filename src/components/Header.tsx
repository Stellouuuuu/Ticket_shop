import Link from "next/link";

interface HeaderProps {
  showAdminLink?: boolean;
}

export default function Header({ showAdminLink = false }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__dates">18 – 19 Juillet</div>
      <div className="site-header__inner">
        <Link href="/tickets" className="site-header__logo-text">
          <span className="site-header__festi">FESTI</span>
          <span className="site-header__chill">CHILL</span>
          <span className="site-header__six">6</span>
        </Link>
        <p className="site-header__theme">Las Favelas</p>
        <p className="site-header__tagline">Cotonou — Réservez en ligne, payez à la livraison</p>
        {showAdminLink && (
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem" }}>
            <Link href="/admin">Admin</Link>
          </p>
        )}
      </div>
    </header>
  );
}
