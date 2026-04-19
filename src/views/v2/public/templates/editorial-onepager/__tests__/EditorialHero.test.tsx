import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { EditorialHero } from "../EditorialHero";
import { DEFAULT_EDITORIAL_CONTENT } from "../fixtures/editorial-fixtures";

describe("EditorialHero", () => {
  it("renders the eyebrow from props", () => {
    render(<EditorialHero content={DEFAULT_EDITORIAL_CONTENT.hero} />);
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.hero.eyebrow),
    ).toBeInTheDocument();
  });

  it("renders the headline prefix, emphasis, and suffix", () => {
    render(<EditorialHero content={DEFAULT_EDITORIAL_CONTENT.hero} />);
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.hero.headlinePrefix, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.hero.headlineEmphasis, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.hero.headlineSuffix, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("renders the supporting paragraph", () => {
    render(<EditorialHero content={DEFAULT_EDITORIAL_CONTENT.hero} />);
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.hero.supporting, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("wraps the hero in a section with id='top' for nav anchoring", () => {
    const { container } = render(
      <EditorialHero content={DEFAULT_EDITORIAL_CONTENT.hero} />,
    );
    expect(container.querySelector("section#top")).toBeInTheDocument();
  });
});
