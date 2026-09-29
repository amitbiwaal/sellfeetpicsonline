/**
 * Makes the database ready: applies migrations, loads the starter content
 * (first run only) and creates the first admin from ADMIN_EMAIL/ADMIN_PASSWORD
 * when no admin exists yet. Runs automatically before `dev` and `build`.
 */
import "./_env";

export async function prepareDatabase({ quiet = false } = {}) {
  const log = (...args: unknown[]) => !quiet && console.log(...args);
  const { getDatabaseUrl } = await import("../src/lib/db/index");
  const url = getDatabaseUrl();

  if (process.env.VERCEL && url.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL points to a local SQLite file, which does not persist on Vercel. " +
        "Create a Turso database and set DATABASE_URL and DATABASE_AUTH_TOKEN in your Vercel project settings.",
    );
  }

  const { runMigrations } = await import("../src/lib/db/migrate");
  const { seedDatabase } = await import("../src/lib/db/seed");
  const { countUsers, upsertAdminUser } = await import("../src/lib/db/admin-user");

  await runMigrations();
  log(`✓ Database ready (${url.startsWith("file:") ? url : url.replace(/\/\/.*@/, "//***@")})`);

  const seeded = await seedDatabase();
  if (!seeded.skipped) {
    log(
      `✓ Starter content loaded: ${seeded.posts} posts, ${seeded.pages} pages, ${seeded.platforms} platforms, ${seeded.media} images`,
    );
  }

  if ((await countUsers()) === 0) {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();
    if (email && password) {
      await upsertAdminUser({ email, password, name: "Admin" });
      log(`✓ Admin account created for ${email}`);
    } else {
      log("! No admin account yet. Run `npm run setup` or `npm run admin:create -- --email you@example.com --password <password>`.");
    }
  }
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/prepare-db.ts");
if (isDirectRun) {
  prepareDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(`✗ ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    });
}
