"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import AdminTable from "@/components/AdminTable";
import AdminSettings from "@/components/AdminSettings";

const STORAGE_KEY = "festichill_admin_token";
const USERNAME_KEY = "festichill_admin_username";

type AdminTab = "orders" | "settings";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [loginUsername, setLoginUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<AdminTab>("orders");

  useEffect(() => {
    const savedToken = sessionStorage.getItem(STORAGE_KEY);
    const savedUsername = sessionStorage.getItem(USERNAME_KEY);
    if (savedToken) setToken(savedToken);
    if (savedUsername) setUsername(savedUsername);
    setHydrated(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Erreur de connexion.");
        return;
      }

      sessionStorage.setItem(STORAGE_KEY, data.token);
      sessionStorage.setItem(USERNAME_KEY, data.admin.username);
      setToken(data.token);
      setUsername(data.admin.username);
      setPassword("");
    } catch {
      setLoginError(
        "Connexion impossible. Réessayez, ou vérifiez que la base MySQL AlwaysData est accessible."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    if (token) {
      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        /* ignore */
      }
    }
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername("");
  }

  if (!hydrated) {
    return null;
  }

  return (
    <>
      <div className="top-bar">
        <SiteNav />
      </div>

      <main className="container container-wide admin-page">
        {!token ? (
          <div className="card admin-login">
            <h1>Admin Festichill</h1>
            <p className="subtitle">Accès réservé à l&apos;équipe.</p>

            {loginError && <div className="error-message">{loginError}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Identifiant</label>
                <input
                  id="username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loginLoading}
              >
                {loginLoading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="admin-tabs">
              <button
                type="button"
                className={`admin-tabs__btn ${tab === "orders" ? "admin-tabs__btn--active" : ""}`}
                onClick={() => setTab("orders")}
              >
                Commandes
              </button>
              <button
                type="button"
                className={`admin-tabs__btn ${tab === "settings" ? "admin-tabs__btn--active" : ""}`}
                onClick={() => setTab("settings")}
              >
                Paramètres
              </button>
              <button
                type="button"
                className="btn btn-secondary admin-tabs__logout"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>

            {tab === "orders" ? (
              <AdminTable token={token} onLogout={handleLogout} />
            ) : (
              <AdminSettings
                token={token}
                currentUsername={username}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}
