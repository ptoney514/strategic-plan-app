import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { EditorialFooter } from "../EditorialFooter";
import { DEFAULT_EDITORIAL_CONTENT } from "../fixtures/editorial-fixtures";

describe("EditorialFooter", () => {
  it("renders the organization name", () => {
    render(<EditorialFooter content={DEFAULT_EDITORIAL_CONTENT.footer} />);
    expect(
      screen.getByText(DEFAULT_EDITORIAL_CONTENT.footer.organizationName),
    ).toBeInTheDocument();
  });

  it("renders each column heading", () => {
    render(<EditorialFooter content={DEFAULT_EDITORIAL_CONTENT.footer} />);
    for (const column of DEFAULT_EDITORIAL_CONTENT.footer.columns) {
      expect(screen.getByText(column.heading)).toBeInTheDocument();
    }
  });

  it("renders anchor items as links and label-only items as text", () => {
    render(<EditorialFooter content={DEFAULT_EDITORIAL_CONTENT.footer} />);
    for (const column of DEFAULT_EDITORIAL_CONTENT.footer.columns) {
      for (const item of column.items) {
        if (item.href) {
          const link = screen.getByRole("link", { name: item.label });
          expect(link).toHaveAttribute("href", item.href);
        } else {
          expect(screen.getByText(item.label)).toBeInTheDocument();
        }
      }
    }
  });
});
