/** Return a JSON 200 response */
export function jsonOk<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

/** Return a JSON error response */
export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Parse pagination params from URL search params */
export function parsePagination(url: URL) {
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") || "100", 10),
    500,
  );
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  return { limit, offset };
}
