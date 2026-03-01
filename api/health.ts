import "./lib/sentry.js";
import { db } from "./lib/db.js";
import { organizations } from "./lib/schema/index.js";

export async function GET() {
  try {
    const start = Date.now();
    await db.select().from(organizations).limit(1);
    const latencyMs = Date.now() - start;

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: "ok",
          latencyMs,
        },
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      },
      { status: 503 },
    );
  }
}
