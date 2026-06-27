"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "#produit", label: "Produit" },
  { href: "#commander", label: "Commander" },
  { href: "#apropos", label: "En savoir plus" },
  { href: "#avantages", label: "Avantages" },
  { href: "#faq", label: "FAQ" },
] as const;

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen(false);
  }

  return (
    <nav className="site-nav" aria-label="Navigation principale">
      <Link href="/tickets" className="site-nav__logo" onClick={handleClick}>
        <span className="site-nav__festi">FESTI</span>
        <span className="site-nav__chill">CHILL</span>
        <span className="site-nav__six">6</span>
      </Link>

      <button
        type="button"
        className="site-nav__toggle"
        aria-expanded={open}
        aria-controls="site-nav-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`site-nav__burger ${open ? "site-nav__burger--open" : ""}`} />
      </button>

      <ul
        id="site-nav-menu"
        className={`site-nav__links ${open ? "site-nav__links--open" : ""}`}
      >
        {LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} onClick={handleClick}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
