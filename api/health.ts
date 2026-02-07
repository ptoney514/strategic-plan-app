import { db } from "./lib/db";
import { organizations } from "./lib/schema/index";

export async function GET() {
  try {
    const result = await db.select().from(organizations).limit(1);
    return Response.json({
      status: "ok",
      database: "connected",
      runtime: "nodejs",
      tables: result.length >= 0 ? "accessible" : "error",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
