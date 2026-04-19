import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { PullQuoteBand } from "../PullQuoteBand";
import { DEFAULT_EDITORIAL_CONTENT } from "../fixtures/editorial-fixtures";

describe("PullQuoteBand", () => {
  it("renders the quote text from props", () => {
    render(<PullQuoteBand content={DEFAULT_EDITORIAL_CONTENT.pullQuote} />);
    expect(
      screen.getByText(
        new RegExp(
          DEFAULT_EDITORIAL_CONTENT.pullQuote.text.slice(0, 30),
          "i",
        ),
      ),
    ).toBeInTheDocument();
  });

  it("renders the attribution", () => {
    render(<PullQuoteBand content={DEFAULT_EDITORIAL_CONTENT.pullQuote} />);
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.pullQuote.attribution),
    ).toBeInTheDocument();
  });

  it("renders every stat label", () => {
    render(<PullQuoteBand content={DEFAULT_EDITORIAL_CONTENT.pullQuote} />);
    for (const stat of DEFAULT_EDITORIAL_CONTENT.pullQuote.stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });

  it("renders one node per stat", () => {
    // Stats share the same visual slot, so just count that we rendered three.
    const { container } = render(
      <PullQuoteBand content={DEFAULT_EDITORIAL_CONTENT.pullQuote} />,
    );
    const statContainer = container.querySelector(
      ".grid.md\\:grid-cols-3",
    );
    expect(statContainer?.children.length).toBe(3);
  });
});
