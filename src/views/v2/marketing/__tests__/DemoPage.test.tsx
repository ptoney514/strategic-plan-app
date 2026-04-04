import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/setup";
import userEvent from "@testing-library/user-event";
import { DemoPage } from "../DemoPage";

// Mock apiPost
vi.mock("@/lib/api", () => ({
  apiPost: vi.fn().mockResolvedValue({ id: "test-id" }),
}));

describe("DemoPage", () => {
  it("renders the page heading", () => {
    render(<DemoPage />);
    expect(
      screen.getByRole("heading", {
        name: /experience the future of data governance/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders value propositions", () => {
    render(<DemoPage />);
    expect(screen.getByText("Personalized walkthrough")).toBeInTheDocument();
    expect(
      screen.getByText("Implementation consultation"),
    ).toBeInTheDocument();
    expect(screen.getByText("Procurement readiness")).toBeInTheDocument();
  });

  it("renders the demo form", () => {
    render(<DemoPage />);
    expect(screen.getByPlaceholderText("Jane Smith")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("jane@district.org"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit request/i }),
    ).toBeInTheDocument();
  });

  it("renders how teams go live section", () => {
    render(<DemoPage />);
    expect(screen.getByText("How teams go live")).toBeInTheDocument();
    expect(screen.getByText("Bring in the plan")).toBeInTheDocument();
  });

  it("renders FAQ section", () => {
    render(<DemoPage />);
    expect(
      screen.getByText("Questions districts ask before switching"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Can we import from our current spreadsheet?"),
    ).toBeInTheDocument();
  });

  it("shows success state after form submission", async () => {
    const user = userEvent.setup();
    render(<DemoPage />);

    await user.type(screen.getByPlaceholderText("Jane Smith"), "Jane Smith");
    await user.type(
      screen.getByPlaceholderText("jane@district.org"),
      "jane@test.org",
    );
    await user.selectOptions(
      screen.getByRole("combobox"),
      "Superintendent",
    );
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText(/thanks for reaching out/i),
    ).toBeInTheDocument();
  });
});
