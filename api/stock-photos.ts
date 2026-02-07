import { eq } from "drizzle-orm";
import { db } from "./lib/db";
import { stockPhotos } from "./lib/schema/index";
import { jsonOk, jsonError } from "./lib/response";

/**
 * GET /api/stock-photos
 * List stock photos. No auth required.
 * Optional query param: ?category=xxx
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    let query = db.select().from(stockPhotos);

    if (category) {
      query = query.where(eq(stockPhotos.category, category)) as typeof query;
    }

    const photos = await query.orderBy(stockPhotos.createdAt);

    return jsonOk(
      photos.map((p) => ({
        id: p.id,
        url: p.url,
        alt_text: p.altText,
        category: p.category,
        created_at: p.createdAt,
      })),
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
