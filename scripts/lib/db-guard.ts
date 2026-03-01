/**
 * Production Database Guard
 *
 * Prevents seed scripts from running against the production database.
 * Compares DATABASE_URL against NEON_PRODUCTION_ENDPOINT to detect
 * accidental production connections.
 *
 * Usage: import and call at the top of seed scripts (after env loading).
 */

export function guardAgainstProduction(): void {
  const databaseUrl = process.env.DATABASE_URL;
  const productionEndpoint = process.env.NEON_PRODUCTION_ENDPOINT;

  if (!productionEndpoint) {
    console.warn(
      '⚠️  NEON_PRODUCTION_ENDPOINT is not set — production guard is disabled.\n' +
        '   Set it in .env.local to protect against accidental production writes.\n'
    );
    return;
  }

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set. Exiting.');
    process.exit(1);
  }

  if (databaseUrl.includes(productionEndpoint)) {
    console.error(
      '🛑 ABORT: DATABASE_URL points to the PRODUCTION database.\n' +
        '   This seed script should only run against a dev/branch database.\n' +
        '   Switch DATABASE_URL to a Neon dev branch and try again.\n'
    );
    process.exit(1);
  }
}
