import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/setup";
import { AboutPage } from "../AboutPage";
import { PrivacyPage } from "../PrivacyPage";
import { TermsPage } from "../TermsPage";

describe("Public legal and about pages", () => {
  it("renders the about page hero and example CTA", () => {
    render(<AboutPage />);

    expect(
      screen.getByText(
        "Modernizing how districts communicate strategic progress.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("View a live district example").closest("a"),
    ).toHaveAttribute("href", "/district/westside");
  });

  it("renders the privacy page heading and contact email", () => {
    render(<PrivacyPage />);

    expect(
      screen.getByRole("heading", { name: "Privacy Policy" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("privacy@stratadash.org").closest("a"),
    ).toHaveAttribute("href", "mailto:privacy@stratadash.org");
    expect(screen.getAllByText("Student and district data")).toHaveLength(2);
  });

  it("renders the terms page heading, toc item, and legal contact link", () => {
    render(<TermsPage />);

    expect(
      screen.getByRole("heading", { name: /terms of service/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Acceptance of terms")).toHaveLength(2);
    expect(
      screen.getByText("legal@stratadash.org").closest("a"),
    ).toHaveAttribute("href", "mailto:legal@stratadash.org");
  });
});
