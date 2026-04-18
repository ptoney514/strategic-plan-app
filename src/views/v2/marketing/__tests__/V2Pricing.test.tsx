import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { V2Pricing } from "../V2Pricing";

describe("V2Pricing", () => {
  it("renders the pricing heading", () => {
    render(<V2Pricing />);

    expect(
      screen.getByText("Strategy is the work. The software should just work."),
    ).toBeInTheDocument();
  });

  it("renders pricing description", () => {
    render(<V2Pricing />);

    expect(
      screen.getByText(/transparent annual pricing for public-sector teams/i),
    ).toBeInTheDocument();
  });

  it("renders all three pricing tiers", () => {
    render(<V2Pricing />);

    expect(screen.getByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("District")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders tier prices", () => {
    render(<V2Pricing />);

    expect(screen.getByText("$4,500")).toBeInTheDocument();
    expect(screen.getByText("$12,000")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("renders the featured badge for the District tier", () => {
    render(<V2Pricing />);

    expect(screen.getByText("Most requested")).toBeInTheDocument();
  });

  it("renders CTA buttons for each tier", () => {
    render(<V2Pricing />);

    expect(screen.getByText("Start pilot")).toBeInTheDocument();
    expect(screen.getByText("Select district plan")).toBeInTheDocument();
    expect(screen.getByText("Inquire today")).toBeInTheDocument();
  });

  it("renders feature lists for each tier", () => {
    render(<V2Pricing />);

    expect(screen.getByText("1 active strategic plan")).toBeInTheDocument();
    expect(screen.getByText("Board presentation mode")).toBeInTheDocument();
    expect(screen.getByText("Dedicated strategic advisor")).toBeInTheDocument();
  });

  it("links the pilot CTA to email", () => {
    render(<V2Pricing />);

    const getStartedLink = screen.getByText("Start pilot");
    expect(getStartedLink.closest("a")).toHaveAttribute(
      "href",
      "mailto:sales@stratadash.org?subject=StrataDash%20pilot",
    );
  });

  it("renders the foundational section heading", () => {
    render(<V2Pricing />);

    expect(screen.getByText("Foundationally integrated.")).toBeInTheDocument();
    expect(
      screen.getByText("Common procurement inquiries"),
    ).toBeInTheDocument();
  });
});
