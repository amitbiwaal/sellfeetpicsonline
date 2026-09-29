/**
 * First-time setup:  npm run setup
 *
 * 1. Creates .env with a random SESSION_SECRET and an initial admin login
 * 2. Creates the database, runs migrations and loads the starter content
 * 3. Prints the admin login details
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ENV_FILE = path.join(process.cwd(), ".env");

function randomPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(14);
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${body}7`;
}

function ensureEnvFile() {
  const existing = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "";
  const has = (key: string) => new RegExp(`^\\s*${key}\\s*=`, "m").test(existing);
  const additions: string[] = [];

  if (!existing) {
    additions.push("# SellFeetOnline configuration (created by `npm run setup`). Never commit this file.");
  }
  if (!has("NEXT_PUBLIC_SITE_URL")) additions.push("NEXT_PUBLIC_SITE_URL=https://sellfeetonline.com");
  if (!has("DATABASE_URL")) additions.push("DATABASE_URL=file:./data/sellfeetonline.db");
  if (!has("SESSION_SECRET")) additions.push(`SESSION_SECRET=${crypto.randomBytes(48).toString("base64url")}`);
  if (!has("ADMIN_EMAIL")) additions.push("ADMIN_EMAIL=admin@sellfeetonline.com");
  if (!has("ADMIN_PASSWORD")) {
    additions.push("# Initial admin password. Change it after your first login (Admin → Users).");
    additions.push(`ADMIN_PASSWORD=${randomPassword()}`);
  }

  if (additions.length) {
    const prefix = existing && !existing.endsWith("\n") ? "\n" : "";
    fs.appendFileSync(ENV_FILE, `${prefix}${additions.join("\n")}\n`);
    console.log(existing ? "✓ Added missing values to .env" : "✓ Created .env");
  } else {
    console.log("✓ .env already configured");
  }
}

async function main() {
  ensureEnvFile();
  await import("./_env");
  const { prepareDatabase } = await import("./prepare-db");
  await prepareDatabase();

  console.log("\nAll set! Start the site with:  npm run dev");
  console.log("Website:      http://localhost:3000");
  console.log("Admin panel:  http://localhost:3000/admin/");
  console.log(`Admin login:  ${process.env.ADMIN_EMAIL}  /  ${process.env.ADMIN_PASSWORD}`);
  console.log("(Login details are stored in .env — change the password after logging in.)");
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
