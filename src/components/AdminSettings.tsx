"use client";

import { useCallback, useEffect, useState } from "react";

interface Admin {
  id: number;
  username: string;
  created_at: string;
}

interface NotificationRecipient {
  id: number;
  email: string;
  label: string | null;
  created_at: string;
}

interface AdminSettingsProps {
  token: string;
  currentUsername: string;
  onLogout: () => void;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export default function AdminSettings({
  token,
  currentUsername,
  onLogout,
}: AdminSettingsProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newEmailLabel, setNewEmailLabel] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [adminsRes, recipientsRes] = await Promise.all([
        fetch("/api/admin/admins", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (adminsRes.status === 401 || recipientsRes.status === 401) {
        onLogout();
        return;
      }

      if (!adminsRes.ok || !recipientsRes.ok) {
        throw new Error();
      }

      setAdmins(await adminsRes.json());
      setRecipients(await recipientsRes.json());
    } catch {
      setError("Impossible de charger les paramètres.");
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function flashSuccess(message: string) {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) {
        setError(data.error || "Erreur.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      flashSuccess("Mot de passe modifié avec succès.");
    } catch {
      setError("Erreur lors du changement de mot de passe.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdminLoading(true);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          username: newAdminUsername,
          password: newAdminPassword,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) {
        setError(data.error || "Erreur.");
        return;
      }

      setNewAdminUsername("");
      setNewAdminPassword("");
      flashSuccess(`Administrateur « ${data.username} » ajouté.`);
      await loadData();
    } catch {
      setError("Erreur lors de l'ajout de l'administrateur.");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleDeleteAdmin(id: number, username: string) {
    if (!confirm(`Supprimer l'administrateur « ${username} » ?`)) return;

    setError("");
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) {
        setError(data.error || "Erreur.");
        return;
      }

      flashSuccess(`Administrateur « ${username} » supprimé.`);
      await loadData();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  }

  async function handleAddEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailLoading(true);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          email: newEmail,
          label: newEmailLabel || undefined,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) {
        setError(data.error || "Erreur.");
        return;
      }

      setNewEmail("");
      setNewEmailLabel("");
      flashSuccess(`Email « ${data.email} » ajouté.`);
      await loadData();
    } catch {
      setError("Erreur lors de l'ajout de l'email.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleDeleteEmail(id: number, email: string) {
    if (!confirm(`Retirer « ${email} » des notifications ?`)) return;

    setError("");
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur.");
        return;
      }

      flashSuccess(`Email « ${email} » retiré.`);
      await loadData();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  }

  if (loading) {
    return <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>;
  }

  return (
    <div className="admin-settings">
      <div className="admin-header">
        <h1 style={{ margin: 0, color: "var(--favela-green)" }}>Paramètres</h1>
        <p className="subtitle" style={{ margin: "0.25rem 0 0" }}>
          Connecté en tant que <strong>{currentUsername}</strong>
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <section className="admin-settings__section card">
        <h2>Changer mon mot de passe</h2>
        <form onSubmit={handleChangePassword} className="admin-settings__form">
          <div className="form-group">
            <label htmlFor="current_password">Mot de passe actuel</label>
            <input
              id="current_password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="new_password">Nouveau mot de passe</label>
              <input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm_password">Confirmer</label>
              <input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={passwordLoading}
            style={{ width: "auto" }}
          >
            {passwordLoading ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </form>
      </section>

      <section className="admin-settings__section card">
        <h2>Administrateurs</h2>
        <p className="subtitle">
          Comptes autorisés à accéder au panneau admin.
        </p>

        <ul className="admin-settings__list">
          {admins.map((admin) => (
            <li key={admin.id} className="admin-settings__list-item">
              <div>
                <strong>{admin.username}</strong>
                {admin.username === currentUsername && (
                  <span className="admin-settings__badge">Vous</span>
                )}
              </div>
              {admin.username !== currentUsername && (
                <button
                  type="button"
                  className="btn btn-ghost admin-settings__remove"
                  onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                >
                  Retirer
                </button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddAdmin} className="admin-settings__form">
          <h3>Ajouter un administrateur</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="new_admin_username">Identifiant</label>
              <input
                id="new_admin_username"
                type="text"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                required
                placeholder="Ex : grace"
              />
            </div>
            <div className="form-group">
              <label htmlFor="new_admin_password">Mot de passe</label>
              <input
                id="new_admin_password"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={adminLoading}
            style={{ width: "auto" }}
          >
            {adminLoading ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </section>

      <section className="admin-settings__section card">
        <h2>Notifications équipe</h2>
        <p className="subtitle">
          Sans domaine vérifié sur Resend, seul l&apos;email configuré dans{" "}
          <code>RESEND_TO_EMAIL</code> reçoit les mails (votre adresse perso).
          Le reste de l&apos;équipe est alerté via le panneau{" "}
          <strong>Commandes</strong> (rafraîchissement auto toutes les 30 s +
          notifications navigateur).
        </p>

        <div className="admin-settings__info">
          Configurez sur Render :{" "}
          <code>RESEND_TO_EMAIL=stellagbaguidi68@gmail.com</code>
        </div>
      </section>

      <section className="admin-settings__section card">
        <h2>Emails (SMTP local uniquement)</h2>
        <p className="subtitle">
          Liste utilisée uniquement en local avec SMTP. Ignorée en mode test
          Resend sur Render.
        </p>

        <ul className="admin-settings__list">
          {recipients.length === 0 ? (
            <li className="admin-settings__list-item admin-settings__list-item--empty">
              Aucun email configuré — les notifications ne seront pas envoyées.
            </li>
          ) : (
            recipients.map((recipient) => (
              <li key={recipient.id} className="admin-settings__list-item">
                <div>
                  <strong>{recipient.email}</strong>
                  {recipient.label && (
                    <span className="admin-settings__label">{recipient.label}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost admin-settings__remove"
                  onClick={() =>
                    handleDeleteEmail(recipient.id, recipient.email)
                  }
                >
                  Retirer
                </button>
              </li>
            ))
          )}
        </ul>

        <form onSubmit={handleAddEmail} className="admin-settings__form">
          <h3>Ajouter un email</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="new_email">Adresse email</label>
              <input
                id="new_email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                placeholder="equipe@festichill.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="new_email_label">Libellé (optionnel)</label>
              <input
                id="new_email_label"
                type="text"
                value={newEmailLabel}
                onChange={(e) => setNewEmailLabel(e.target.value)}
                placeholder="Ex : Axel"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={emailLoading}
            style={{ width: "auto" }}
          >
            {emailLoading ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </section>
    </div>
  );
}
