import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db and auth before importing the handler
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();

vi.mock("../../../lib/db.js", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
  },
}));

vi.mock("../../../lib/middleware/auth.js", () => ({
  requireAuth: vi.fn().mockResolvedValue({ user: { id: "user-1" } }),
}));

// Import the constants and regex directly by re-declaring them
// (the handler exports only GET, so we test the logic inline)
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "www",
  "login",
  "signup",
  "dashboard",
  "v2",
  "settings",
  "support",
  "help",
]);

function validateSlugFormat(slug: string): { valid: boolean; reason?: string } {
  if (slug.length < 3 || slug.length > 50) {
    return { valid: false, reason: "Slug must be between 3 and 50 characters" };
  }
  if (!SLUG_REGEX.test(slug)) {
    return {
      valid: false,
      reason:
        "Slug must contain only lowercase letters, numbers, and hyphens",
    };
  }
  return { valid: true };
}

function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

describe("slug validation", () => {
  describe("slug format validation", () => {
    it("accepts valid slugs", () => {
      expect(validateSlugFormat("westside-66")).toEqual({ valid: true });
      expect(validateSlugFormat("my-district")).toEqual({ valid: true });
      expect(validateSlugFormat("abc")).toEqual({ valid: true });
      expect(validateSlugFormat("a1b")).toEqual({ valid: true });
      expect(validateSlugFormat("test-org-name")).toEqual({ valid: true });
    });

    it("rejects slugs that are too short (1-2 chars)", () => {
      expect(validateSlugFormat("a").valid).toBe(false);
      expect(validateSlugFormat("ab").valid).toBe(false);
      expect(validateSlugFormat("a").reason).toContain("3 and 50 characters");
      expect(validateSlugFormat("ab").reason).toContain("3 and 50 characters");
    });

    it("rejects slugs that are too long (51+ chars)", () => {
      const longSlug = "a".repeat(51);
      const result = validateSlugFormat(longSlug);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("3 and 50 characters");
    });

    it("accepts slugs at boundary lengths (3 and 50 chars)", () => {
      expect(validateSlugFormat("abc").valid).toBe(true);
      const fiftyCharSlug = "a" + "b".repeat(48) + "c";
      expect(fiftyCharSlug.length).toBe(50);
      expect(validateSlugFormat(fiftyCharSlug).valid).toBe(true);
    });

    it("rejects slugs with spaces", () => {
      const result = validateSlugFormat("my district");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("lowercase letters, numbers, and hyphens");
    });

    it("rejects slugs with special characters", () => {
      expect(validateSlugFormat("my@district").valid).toBe(false);
      expect(validateSlugFormat("my!org").valid).toBe(false);
      expect(validateSlugFormat("my#org").valid).toBe(false);
      expect(validateSlugFormat("my_org").valid).toBe(false);
      expect(validateSlugFormat("my.org").valid).toBe(false);
    });

    it("rejects slugs starting with a hyphen", () => {
      const result = validateSlugFormat("-my-org");
      expect(result.valid).toBe(false);
    });

    it("rejects slugs ending with a hyphen", () => {
      const result = validateSlugFormat("my-org-");
      expect(result.valid).toBe(false);
    });

    it("rejects uppercase characters via regex", () => {
      expect(validateSlugFormat("MyOrg").valid).toBe(false);
      expect(validateSlugFormat("ALLCAPS").valid).toBe(false);
    });
  });

  describe("reserved slugs", () => {
    it("detects 'admin' as reserved", () => {
      expect(isReservedSlug("admin")).toBe(true);
    });

    it("detects 'api' as reserved", () => {
      expect(isReservedSlug("api")).toBe(true);
    });

    it("detects 'www' as reserved", () => {
      expect(isReservedSlug("www")).toBe(true);
    });

    it("covers all expected reserved words", () => {
      const expectedReserved = [
        "admin",
        "api",
        "app",
        "www",
        "login",
        "signup",
        "dashboard",
        "v2",
        "settings",
        "support",
        "help",
      ];

      for (const word of expectedReserved) {
        expect(isReservedSlug(word)).toBe(true);
      }

      expect(RESERVED_SLUGS.size).toBe(expectedReserved.length);
    });

    it("does not flag non-reserved slugs", () => {
      expect(isReservedSlug("westside")).toBe(false);
      expect(isReservedSlug("my-district")).toBe(false);
      expect(isReservedSlug("admin-panel")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("rejects empty string", () => {
      const result = validateSlugFormat("");
      expect(result.valid).toBe(false);
    });

    it("empty string is not in reserved set", () => {
      expect(isReservedSlug("")).toBe(false);
    });
  });
});

describe("check-slug endpoint handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when slug param is missing", async () => {
    const { GET } = await import("../check-slug.js");

    const req = new Request("http://localhost/api/v2/onboarding/check-slug");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("slug query parameter is required");
  });

  it("returns unavailable for a slug that is too short", async () => {
    const { GET } = await import("../check-slug.js");

    const req = new Request(
      "http://localhost/api/v2/onboarding/check-slug?slug=ab"
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.available).toBe(false);
    expect(body.reason).toContain("3 and 50");
  });

  it("returns unavailable for a reserved slug", async () => {
    const { GET } = await import("../check-slug.js");

    const req = new Request(
      "http://localhost/api/v2/onboarding/check-slug?slug=admin"
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.available).toBe(false);
    expect(body.reason).toContain("reserved");
    expect(body.suggestion).toBe("admin-org");
  });

  it("returns available for a valid, non-reserved slug", async () => {
    const { GET } = await import("../check-slug.js");

    const req = new Request(
      "http://localhost/api/v2/onboarding/check-slug?slug=westside-66"
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.available).toBe(true);
    expect(body.slug).toBe("westside-66");
  });
});
