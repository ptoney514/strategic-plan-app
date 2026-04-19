import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { EditorialNav } from "../EditorialNav";
import { DEFAULT_EDITORIAL_CONTENT } from "../fixtures/editorial-fixtures";

describe("EditorialNav", () => {
  it("renders the brand mark + eyebrow + title from props", () => {
    render(<EditorialNav content={DEFAULT_EDITORIAL_CONTENT.nav} />);
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.nav.brandMark),
    ).toBeInTheDocument();
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.nav.eyebrow),
    ).toBeInTheDocument();
  });

  it("renders every anchor link with correct hrefs", () => {
    render(<EditorialNav content={DEFAULT_EDITORIAL_CONTENT.nav} />);
    for (const anchor of DEFAULT_EDITORIAL_CONTENT.nav.anchors) {
      const link = screen.getByRole("link", { name: anchor.label });
      expect(link).toHaveAttribute("href", anchor.href);
    }
  });

  it("renders the CTA link", () => {
    render(<EditorialNav content={DEFAULT_EDITORIAL_CONTENT.nav} />);
    const cta = screen.getByRole("link", {
      name: new RegExp(DEFAULT_EDITORIAL_CONTENT.nav.ctaLabel, "i"),
    });
    expect(cta).toHaveAttribute("href", "#cta");
  });
});
