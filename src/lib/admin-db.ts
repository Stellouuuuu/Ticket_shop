import mysql from "mysql2/promise";
import { randomBytes } from "crypto";
import { hashPassword, verifyPassword } from "./password";
import { withDbRetry } from "./db";

export interface Admin {
  id: number;
  username: string;
  created_at: string;
}

export interface AdminContext {
  adminId: number;
  username: string;
  token: string;
}

export interface NotificationRecipient {
  id: number;
  email: string;
  label: string | null;
  created_at: string;
}

const SESSION_DAYS = 7;

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function cleanupExpiredSessions(): Promise<void> {
  await withDbRetry(async (db) => {
    await db.execute("DELETE FROM admin_sessions WHERE expires_at < NOW()");
  });
}

export async function validateSession(
  token: string
): Promise<AdminContext | null> {
  if (!token) return null;

  return withDbRetry(async (db) => {
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      `SELECT s.token, a.id AS admin_id, a.username
       FROM admin_sessions s
       JOIN admins a ON a.id = s.admin_id
       WHERE s.token = ? AND s.expires_at > NOW()`,
      [token]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      adminId: row.admin_id as number,
      username: row.username as string,
      token: row.token as string,
    };
  });
}

export async function createSession(adminId: number): Promise<string> {
  await cleanupExpiredSessions();
  const token = generateToken();

  await withDbRetry(async (db) => {
    await db.execute(
      `INSERT INTO admin_sessions (admin_id, token, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [adminId, token, SESSION_DAYS]
    );
  });

  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await withDbRetry(async (db) => {
    await db.execute("DELETE FROM admin_sessions WHERE token = ?", [token]);
  });
}

export async function authenticateAdmin(
  username: string,
  password: string
): Promise<Admin | null> {
  return withDbRetry(async (db) => {
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT id, username, password_hash, created_at FROM admins WHERE username = ?",
      [username.trim()]
    );

    const row = rows[0];
    if (!row) return null;

    const valid = await verifyPassword(password, row.password_hash as string);
    if (!valid) return null;

    return {
      id: row.id as number,
      username: row.username as string,
      created_at: String(row.created_at),
    };
  });
}

export async function changeAdminPassword(
  adminId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 6) {
    return {
      ok: false,
      error: "Le nouveau mot de passe doit faire au moins 6 caractères.",
    };
  }

  return withDbRetry(async (db) => {
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT password_hash FROM admins WHERE id = ?",
      [adminId]
    );

    const row = rows[0];
    if (!row) return { ok: false, error: "Compte introuvable." };

    const valid = await verifyPassword(
      currentPassword,
      row.password_hash as string
    );
    if (!valid) return { ok: false, error: "Mot de passe actuel incorrect." };

    const passwordHash = await hashPassword(newPassword);
    await db.execute("UPDATE admins SET password_hash = ? WHERE id = ?", [
      passwordHash,
      adminId,
    ]);

    return { ok: true };
  });
}

export async function listAdmins(): Promise<Admin[]> {
  return withDbRetry(async (db) => {
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT id, username, created_at FROM admins ORDER BY username ASC"
    );
    return rows as Admin[];
  });
}

export async function countAdmins(): Promise<number> {
  return withDbRetry(async (db) => {
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM admins"
    );
    return Number(rows[0]?.total ?? 0);
  });
}

export async function createAdmin(
  username: string,
  password: string
): Promise<Admin | { error: string }> {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) return { error: "Identifiant requis." };
  if (password.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." };
  }

  const passwordHash = await hashPassword(password);

  try {
    return await withDbRetry(async (db) => {
      const [result] = await db.execute<mysql.ResultSetHeader>(
        "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
        [trimmedUsername, passwordHash]
      );

      return {
        id: result.insertId,
        username: trimmedUsername,
        created_at: new Date().toISOString(),
      };
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ER_DUP_ENTRY"
    ) {
      return { error: "Cet identifiant existe déjà." };
    }
    throw err;
  }
}

export async function deleteAdmin(
  adminId: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const total = await countAdmins();
  if (total <= 1) {
    return {
      ok: false,
      error: "Impossible de supprimer le dernier administrateur.",
    };
  }

  await withDbRetry(async (db) => {
    await db.execute("DELETE FROM admins WHERE id = ?", [adminId]);
  });
  return { ok: true };
}

export async function listNotificationRecipients(): Promise<
  NotificationRecipient[]
> {
  return withDbRetry(async (db) => {
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT id, email, label, created_at FROM notification_recipients ORDER BY email ASC"
    );
    return rows as NotificationRecipient[];
  });
}

export async function getNotificationEmails(): Promise<string[]> {
  const recipients = await listNotificationRecipients();
  return recipients.map((r) => r.email);
}

export async function addNotificationRecipient(
  email: string,
  label?: string
): Promise<NotificationRecipient | { error: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { error: "Adresse email invalide." };
  }

  try {
    return await withDbRetry(async (db) => {
      const [result] = await db.execute<mysql.ResultSetHeader>(
        "INSERT INTO notification_recipients (email, label) VALUES (?, ?)",
        [trimmedEmail, label?.trim() || null]
      );

      return {
        id: result.insertId,
        email: trimmedEmail,
        label: label?.trim() || null,
        created_at: new Date().toISOString(),
      };
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ER_DUP_ENTRY"
    ) {
      return { error: "Cet email est déjà enregistré." };
    }
    throw err;
  }
}

export async function deleteNotificationRecipient(id: number): Promise<void> {
  await withDbRetry(async (db) => {
    await db.execute("DELETE FROM notification_recipients WHERE id = ?", [id]);
  });
}

export async function ensureAdminBootstrap(): Promise<void> {
  const total = await countAdmins();
  if (total === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      console.warn("[admin] Aucun admin en base et ADMIN_PASSWORD non défini.");
      return;
    }
    const result = await createAdmin(username, password);
    if ("error" in result) {
      console.warn("[admin] Bootstrap admin:", result.error);
    } else {
      console.log(`[admin] Compte initial créé : ${username}`);
    }
  }

  const recipients = await listNotificationRecipients();
  if (recipients.length === 0 && process.env.NOTIFICATION_EMAIL) {
    await addNotificationRecipient(process.env.NOTIFICATION_EMAIL, "Équipe");
    console.log("[admin] Email de notification initial ajouté.");
  }
}
