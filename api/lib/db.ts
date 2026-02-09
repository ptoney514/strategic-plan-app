import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

const DATABASE_URL = process.env.DATABASE_URL!;
const isNeon = DATABASE_URL.includes("neon.tech");

let db: NeonHttpDatabase<typeof schema>;

if (isNeon) {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const sql = neon(DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  const pg = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pool = new pg.default.Pool({ connectionString: DATABASE_URL });
  db = drizzle(pool, { schema }) as unknown as NeonHttpDatabase<typeof schema>;
}

export { db };
