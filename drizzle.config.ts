import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL?.trim() || "file:./data/sellfeetonline.db",
    authToken: process.env.DATABASE_AUTH_TOKEN?.trim() || undefined,
  },
});
