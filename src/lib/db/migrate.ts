import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index";

/** Apply pending SQL migrations from /drizzle. Safe to run repeatedly. */
export async function runMigrations() {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
}
