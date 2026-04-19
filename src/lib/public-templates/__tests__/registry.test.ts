import { describe, it, expect } from "vitest";
import {
  PUBLIC_TEMPLATES,
  getPublicTemplate,
  DEFAULT_PUBLIC_TEMPLATE_ID,
} from "../registry";
import type { PublicTemplateId } from "../types";

describe("public template registry", () => {
  it("exposes an entry for every known PublicTemplateId", () => {
    const expected: PublicTemplateId[] = [
      "sidebar-tree",
      "editorial-onepager",
    ];
    for (const id of expected) {
      expect(PUBLIC_TEMPLATES[id]).toBeDefined();
    }
  });

  it("every definition's id matches its registry key", () => {
    for (const [key, definition] of Object.entries(PUBLIC_TEMPLATES)) {
      expect(definition.id).toBe(key);
    }
  });

  it("every definition has required metadata", () => {
    for (const definition of Object.values(PUBLIC_TEMPLATES)) {
      expect(typeof definition.label).toBe("string");
      expect(definition.label.length).toBeGreaterThan(0);
      expect(typeof definition.description).toBe("string");
      expect(definition.description.length).toBeGreaterThan(0);
      expect(definition.LandingView).toBeDefined();
      expect(typeof definition.supportsObjectiveDetailPage).toBe("boolean");
    }
  });

  it("sidebar-tree template supports the objective detail page", () => {
    expect(
      PUBLIC_TEMPLATES["sidebar-tree"].supportsObjectiveDetailPage,
    ).toBe(true);
  });

  it("editorial-onepager template does not support a separate objective detail page", () => {
    expect(
      PUBLIC_TEMPLATES["editorial-onepager"].supportsObjectiveDetailPage,
    ).toBe(false);
  });

  it("DEFAULT_PUBLIC_TEMPLATE_ID is sidebar-tree", () => {
    expect(DEFAULT_PUBLIC_TEMPLATE_ID).toBe("sidebar-tree");
  });

  it("getPublicTemplate returns the definition for a known id", () => {
    const result = getPublicTemplate("editorial-onepager");
    expect(result.id).toBe("editorial-onepager");
  });

  it("getPublicTemplate falls back to the default for an unknown id", () => {
    // Simulate schema drift: DB has a template id the client doesn't know.
    const result = getPublicTemplate("some-future-template" as PublicTemplateId);
    expect(result.id).toBe(DEFAULT_PUBLIC_TEMPLATE_ID);
  });
});
