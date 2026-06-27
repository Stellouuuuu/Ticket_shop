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

function isRemoteHost(host) {
  return host !== "localhost" && host !== "127.0.0.1";
}

function getConnectionConfig() {
  const host = process.env.DB_HOST || "localhost";
  const database = process.env.DB_NAME || "festichill_tickets";
  const remote = process.env.DB_REMOTE === "true" || isRemoteHost(host);

  const cfg = {
    host,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
    connectTimeout: 20000,
  };

  if (remote) {
    cfg.database = database;
  }

  if (process.env.DB_SSL === "true") {
    Object.assign(cfg, {
      ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" },
    });
  }

  return { cfg, remote, database };
}

async function main() {
  const { cfg, remote, database } = getConnectionConfig();

  console.log(`Connexion à ${cfg.host}:${cfg.port} / ${database}...`);

  const connection = await mysql.createConnection(cfg);

  const sqlFile = remote ? "init-db-tables.sql" : "init-db.sql";
  const sql = readFileSync(join(__dirname, sqlFile), "utf-8");
  await connection.query(sql);
  await connection.end();

  if (remote) {
    console.log(`Table 'orders' prête sur ${database} (${cfg.host}).`);
  } else {
    console.log("Base de données initialisée avec succès.");
  }
}

function printHelp(err) {
  const host = process.env.DB_HOST || "localhost";
  const code = err.code || err.errno || "";

  if (code === "ETIMEDOUT" || code === "ECONNREFUSED" || code === "ENOTFOUND") {
    console.error("\n--- Connexion AlwaysData impossible depuis votre PC ---");
    console.error("AlwaysData bloque souvent MySQL depuis l'extérieur.\n");
    console.error("Solution A — phpMyAdmin (le plus simple) :");
    console.error("  1. Panneau AlwaysData > Bases de données > MySQL > phpMyAdmin");
    console.error("  2. Ouvrir la base stellouuu_festichill");
    console.error("  3. Onglet SQL > coller le contenu de scripts/init-db-tables.sql > Exécuter\n");
    console.error("Solution B — Tunnel SSH (terminal 1, laisser ouvert) :");
    console.error("  ssh -L 3307:mysql-stellouuu.alwaysdata.net:3306 stellouuu@ssh-stellouuu.alwaysdata.net -N\n");
    console.error("  Puis dans .env : DB_HOST=127.0.0.1  DB_PORT=3307");
    console.error("  Et relancer : npm run db:init\n");
  }
}

main().catch((err) => {
  const msg = err.message || err.code || String(err);
  console.error("Erreur:", msg);
  printHelp(err);
  process.exit(1);
});
