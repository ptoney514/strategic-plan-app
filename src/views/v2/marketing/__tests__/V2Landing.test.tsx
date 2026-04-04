import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { V2Landing } from "../V2Landing";

describe("V2Landing", () => {
  it("renders the hero heading", () => {
    render(<V2Landing />);

    expect(
      screen.getByRole("heading", {
        name: /make your strategic plan visible to your community/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders hero description", () => {
    render(<V2Landing />);

    expect(
      screen.getByText(
        /turns static strategic plans into a hosted district surface/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders Request a demo CTA button", () => {
    render(<V2Landing />);

    const ctaLinks = screen
      .getAllByText("Request a demo")
      .map((node) => node.closest("a"))
      .filter((link) => link?.getAttribute("href") === "/demo");

    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0]).toBeInTheDocument();
  });

  it("renders example dashboard link", () => {
    render(<V2Landing />);

    const exampleLink = screen.getByText("View example dashboard");
    expect(exampleLink).toBeInTheDocument();
    expect(exampleLink.closest("a")).toHaveAttribute(
      "href",
      "/district/westside",
    );
  });

  it("renders core section headings", () => {
    render(<V2Landing />);

    expect(
      screen.getByText("Built for clarity. Designed for results."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("High-fidelity metrics for every KPI"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ready to visualize your district/i),
    ).toBeInTheDocument();
  });

  it("renders social proof strip with district names", () => {
    render(<V2Landing />);

    expect(screen.getByText("WESTSIDE USD")).toBeInTheDocument();
    expect(screen.getByText("EASTSIDE ISD")).toBeInTheDocument();
  });

  it("renders leadership and community cards", () => {
    render(<V2Landing />);

    expect(screen.getByText("For Leadership")).toBeInTheDocument();
    expect(screen.getByText("For Community")).toBeInTheDocument();
  });
});
