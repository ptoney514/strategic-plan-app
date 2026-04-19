import { describe, it, expect } from "vitest";
import {
  getEditorialContent,
  DEFAULT_EDITORIAL_CONTENT,
} from "../fixtures/editorial-fixtures";

describe("getEditorialContent", () => {
  it("returns Westside-specific content for slug 'westside'", () => {
    const content = getEditorialContent("westside");
    expect(content).not.toBe(DEFAULT_EDITORIAL_CONTENT);
    expect(content.hero.headlineEmphasis).toMatch(/promises/i);
  });

  it("falls back to the generic default for an unknown slug", () => {
    const content = getEditorialContent("unknown-district-xyz");
    expect(content).toBe(DEFAULT_EDITORIAL_CONTENT);
  });

  it("falls back when slug is undefined or empty", () => {
    expect(getEditorialContent(undefined)).toBe(DEFAULT_EDITORIAL_CONTENT);
    expect(getEditorialContent("")).toBe(DEFAULT_EDITORIAL_CONTENT);
  });

  it("every fixture has a complete content shape", () => {
    const content = getEditorialContent("westside");
    expect(content.nav.brandMark).toBeTruthy();
    expect(content.nav.anchors.length).toBeGreaterThan(0);
    expect(content.hero.eyebrow).toBeTruthy();
    expect(content.hero.headlinePrefix).toBeTruthy();
    expect(content.hero.headlineEmphasis).toBeTruthy();
    expect(content.hero.supporting).toBeTruthy();
    expect(content.pullQuote.text).toBeTruthy();
    expect(content.pullQuote.stats.length).toBe(3);
    expect(content.cta.headline).toBeTruthy();
    expect(content.footer.columns.length).toBeGreaterThan(0);
  });
});
