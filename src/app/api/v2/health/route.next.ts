import "@api/lib/sentry";
import { db } from "@api/lib/db";
import { organizations } from "@api/lib/schema/index";

export async function GET() {
  try {
    const start = Date.now();
    await db.select().from(organizations).limit(1);
    const latencyMs = Date.now() - start;

    return Response.json({
      status: "ok",
      version: "v2",
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
        version: "v2",
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
