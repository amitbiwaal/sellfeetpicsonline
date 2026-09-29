/**
 * Create an admin account or reset a password:
 *   npm run admin:create -- --email you@example.com --password "new-password-123" [--name "Your Name"]
 */
import "./_env";
import { parseArgs } from "node:util";

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      password: { type: "string" },
      name: { type: "string" },
    },
  });

  if (!values.email || !values.password) {
    console.log('Usage: npm run admin:create -- --email you@example.com --password "your-password-123" [--name "Your Name"]');
    process.exit(1);
  }

  const { passwordProblem } = await import("../src/lib/auth/password");
  const problem = passwordProblem(values.password);
  if (problem) {
    console.error(`✗ ${problem}`);
    process.exit(1);
  }

  const { runMigrations } = await import("../src/lib/db/migrate");
  const { upsertAdminUser } = await import("../src/lib/db/admin-user");
  await runMigrations();
  const result = await upsertAdminUser({ email: values.email, password: values.password, name: values.name });
  console.log(result.created ? `✓ Admin created: ${result.email}` : `✓ Password updated for ${result.email}`);
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
