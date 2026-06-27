import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Festichill 6 — Las Favelas | Billeterie",
  description:
    "Réservez vos tickets pour Festichill 6 Las Favelas à Cotonou. Paiement à la livraison.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <AppShell>
          {children}
          <footer className="site-footer">
            <div>Festichill 6 — Las Favelas &copy; {new Date().getFullYear()}</div>
            <div className="site-footer__contact">
              <a href="tel:+22993881474">+229 93 88 14 74</a>
              {" / "}
              <a href="tel:+22950037618">50 03 76 18</a>
            </div>
            <div className="site-footer__admin">
              <a href="/admin">Admin</a>
            </div>
          </footer>
        </AppShell>
      </body>
    </html>
  );
}
