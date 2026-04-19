import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index.js";

// Lazy initialization: Next.js evaluates route modules at build time for page data
// collection, but DATABASE_URL is only available at runtime. Using a getter ensures
// the connection is created on first use, not at import time.
let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!_db) {
      const sql = neon(process.env.DATABASE_URL!);
      _db = drizzle(sql, { schema });
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
