import mysql from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filename) {
  const envPath = join(__dirname, "..", filename);
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || "root";
const database = process.env.DB_NAME || "festichill_tickets";

console.log(`Test connexion → ${user}@${host}:${port}/${database}`);

try {
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password: process.env.DB_PASSWORD || "",
    database,
    connectTimeout: 10000,
  });
  await conn.ping();
  const [rows] = await conn.query("SHOW TABLES");
  console.log("Connexion OK.");
  console.log("Tables:", rows.map((r) => Object.values(r)[0]).join(", ") || "(aucune)");
  await conn.end();
} catch (err) {
  const code = err.code || "";
  console.error("Échec:", err.message || code || err);

  if (host.includes("alwaysdata.net")) {
    console.error("\n→ Depuis votre PC, utilisez un tunnel SSH :");
    console.error("  Terminal 1 : npm run tunnel");
    console.error("  Puis copiez .env.local.example vers .env.local");
    console.error("  Terminal 2 : npm run db:test");
  } else if (code === "ECONNREFUSED" && host === "127.0.0.1") {
    console.error("\n→ Le tunnel SSH n'est pas lancé. Exécutez : npm run tunnel");
  }
  process.exit(1);
}
