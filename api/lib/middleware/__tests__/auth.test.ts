import { describe, it, expect } from "vitest";
import { hasMinimumRole } from "../roles";

describe("hasMinimumRole", () => {
  it("returns true when user role meets the required role", () => {
    expect(hasMinimumRole("admin", "admin")).toBe(true);
    expect(hasMinimumRole("owner", "admin")).toBe(true);
    expect(hasMinimumRole("editor", "viewer")).toBe(true);
    expect(hasMinimumRole("viewer", "viewer")).toBe(true);
  });

  it("returns false when user role is below the required role", () => {
    expect(hasMinimumRole("viewer", "editor")).toBe(false);
    expect(hasMinimumRole("viewer", "admin")).toBe(false);
    expect(hasMinimumRole("editor", "admin")).toBe(false);
    expect(hasMinimumRole("admin", "owner")).toBe(false);
  });

  it("returns false for unknown roles", () => {
    expect(hasMinimumRole("unknown", "viewer")).toBe(false);
    expect(hasMinimumRole("admin", "superadmin" as never)).toBe(false);
    expect(hasMinimumRole("", "viewer")).toBe(false);
  });

  it("respects the full role hierarchy order", () => {
    const roles = ["viewer", "editor", "admin", "owner"] as const;

    for (let i = 0; i < roles.length; i++) {
      for (let j = 0; j < roles.length; j++) {
        const expected = i >= j;
        expect(hasMinimumRole(roles[i], roles[j])).toBe(expected);
      }
    }
  });
});
