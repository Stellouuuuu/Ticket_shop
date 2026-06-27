import mysql from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filename) {
  const envPath = join(__dirname, "..", filename);
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

async function main() {
  const host = process.env.DB_HOST || "localhost";
  const database = process.env.DB_NAME || "festichill_tickets";

  console.log(`Migration admin → ${host}/${database}`);

  const connection = await mysql.createConnection({
    host,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database,
    multipleStatements: true,
    connectTimeout: 20000,
  });

  const sql = readFileSync(join(__dirname, "migrate-admin.sql"), "utf8");
  await connection.query(sql);
  console.log("Tables admin créées.");

  const [adminRows] = await connection.query(
    "SELECT COUNT(*) AS total FROM admins"
  );
  const adminCount = Number(adminRows[0].total);

  if (adminCount === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      console.warn("Aucun admin — définissez ADMIN_PASSWORD dans .env");
    } else {
      const passwordHash = await hashPassword(password);
      await connection.execute(
        "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
        [username, passwordHash]
      );
      console.log(`Admin initial créé : ${username}`);
    }
  } else {
    console.log(`${adminCount} admin(s) déjà en base.`);
  }

  const [recipientRows] = await connection.query(
    "SELECT COUNT(*) AS total FROM notification_recipients"
  );
  const recipientCount = Number(recipientRows[0].total);

  if (recipientCount === 0 && process.env.NOTIFICATION_EMAIL) {
    await connection.execute(
      "INSERT INTO notification_recipients (email, label) VALUES (?, ?)",
      [process.env.NOTIFICATION_EMAIL, "Équipe"]
    );
    console.log(`Email notification ajouté : ${process.env.NOTIFICATION_EMAIL}`);
  } else {
    console.log(`${recipientCount} email(s) de notification en base.`);
  }

  await connection.end();
  console.log("Migration terminée.");
}

main().catch((err) => {
  console.error("Erreur:", err.message || err);
  process.exit(1);
});
