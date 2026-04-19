import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { QuarterlyCTABand } from "../QuarterlyCTABand";
import { DEFAULT_EDITORIAL_CONTENT } from "../fixtures/editorial-fixtures";

describe("QuarterlyCTABand", () => {
  it("renders the headline", () => {
    render(<QuarterlyCTABand content={DEFAULT_EDITORIAL_CONTENT.cta} />);
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.cta.headline, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("renders the body copy", () => {
    render(<QuarterlyCTABand content={DEFAULT_EDITORIAL_CONTENT.cta} />);
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.cta.body, { exact: false }),
    ).toBeInTheDocument();
  });

  it("renders the signup button as disabled (Phase 4 placeholder form)", () => {
    render(<QuarterlyCTABand content={DEFAULT_EDITORIAL_CONTENT.cta} />);
    const btn = screen.getByRole("button", {
      name: new RegExp(DEFAULT_EDITORIAL_CONTENT.cta.buttonLabel, "i"),
    });
    expect(btn).toBeDisabled();
  });

  it("wraps the band in a section with id='cta'", () => {
    const { container } = render(
      <QuarterlyCTABand content={DEFAULT_EDITORIAL_CONTENT.cta} />,
    );
    expect(container.querySelector("section#cta")).toBeInTheDocument();
  });
});
