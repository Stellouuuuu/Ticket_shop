/**
 * AlwaysData sets IP + PORT; Next.js standalone reads HOSTNAME + PORT.
 * https://help.alwaysdata.com/en/web-hosting/sites/connection-to-upstream/
 */
process.env.HOSTNAME = process.env.IP || process.env.HOSTNAME || "0.0.0.0";

await import(new URL("../.next/standalone/server.js", import.meta.url));
