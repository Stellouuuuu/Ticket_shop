import type { ConnectionOptions, PoolOptions } from "mysql2/promise";

function isRemoteHost(host: string): boolean {
  return host !== "localhost" && host !== "127.0.0.1";
}

export function getDbConfig(): ConnectionOptions {
  const host = process.env.DB_HOST || "localhost";
  const remote = process.env.DB_REMOTE === "true" || isRemoteHost(host);

  const config: ConnectionOptions = {
    host,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "festichill_tickets",
    connectTimeout: remote ? 30000 : 15000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };

  if (process.env.DB_SSL === "true") {
    config.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
    };
  }

  return config;
}

export function getPoolConfig(): PoolOptions {
  const host = process.env.DB_HOST || "localhost";
  const remote = process.env.DB_REMOTE === "true" || isRemoteHost(host);

  return {
    ...getDbConfig(),
    waitForConnections: true,
    connectionLimit: remote ? 3 : 10,
    maxIdle: remote ? 2 : 10,
    idleTimeout: remote ? 30000 : 60000,
    queueLimit: 0,
  };
}

export function isRetryableDbError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ENOTFOUND" ||
    code === "PROTOCOL_CONNECTION_LOST"
  );
}
