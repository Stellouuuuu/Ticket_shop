import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
      <h1>Page introuvable</h1>
      <p className="subtitle">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/tickets" className="btn btn-primary" style={{ maxWidth: 280 }}>
        Retour aux tickets
      </Link>
    </main>
  );
}
