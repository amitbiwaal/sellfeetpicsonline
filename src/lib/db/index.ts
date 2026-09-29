import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const DEFAULT_DATABASE_URL = "file:./data/sellfeetonline.db";

export function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
}

type DbBundle = { client: Client; db: LibSQLDatabase<typeof schema> };

function createDb(): DbBundle {
  const url = getDatabaseUrl();

  // libSQL does not create missing folders for local SQLite files.
  if (url.startsWith("file:")) {
    const filePath = url.slice("file:".length);
    fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
  }

  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN?.trim() || undefined,
  });

  if (url.startsWith("file:")) {
    // Better concurrency for a local file database. Failures are harmless.
    client.execute("PRAGMA journal_mode = WAL").catch(() => {});
    client.execute("PRAGMA busy_timeout = 5000").catch(() => {});
  }
  client.execute("PRAGMA foreign_keys = ON").catch(() => {});

  return { client, db: drizzle(client, { schema }) };
}

// Reuse one connection across hot reloads in development.
const globalForDb = globalThis as unknown as { __sfoDb?: DbBundle };
const bundle = globalForDb.__sfoDb ?? createDb();
globalForDb.__sfoDb = bundle;

export const db = bundle.db;
export const dbClient = bundle.client;
export { schema };
