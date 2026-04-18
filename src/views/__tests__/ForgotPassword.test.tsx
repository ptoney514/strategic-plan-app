import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../test/setup";
import userEvent from "@testing-library/user-event";
import { ForgotPassword } from "../ForgotPassword";

// Mock the auth client
const mockRequestPasswordReset = vi.fn();
vi.mock("../../lib/auth-client", () => ({
  authClient: {
    requestPasswordReset: (...args: unknown[]) =>
      mockRequestPasswordReset(...args),
  },
}));

describe("ForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestPasswordReset.mockResolvedValue({});
  });

  it("renders the page title and description", () => {
    render(<ForgotPassword />);
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your email and we'll send you a reset link."),
    ).toBeInTheDocument();
  });

  it("renders email input and submit button", () => {
    render(<ForgotPassword />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it("has a link back to login", () => {
    render(<ForgotPassword />);
    const link = screen.getByText(/back to login/i);
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/login");
  });

  it("calls requestPasswordReset with email on submit", async () => {
    const user = userEvent.setup();
    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: "test@example.com",
        redirectTo: "/reset-password",
      });
    });
  });

  it("shows success message after submission", async () => {
    const user = userEvent.setup();
    render(<ForgotPassword />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com",
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/if an account exists/i)).toBeInTheDocument();
    });
  });

  it("disables form after successful submission", async () => {
    const user = userEvent.setup();
    render(<ForgotPassword />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com",
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /send reset link/i }),
      ).toBeDisabled();
    });
  });

  it("shows success message even when API returns non-fetch error (prevents email enumeration)", async () => {
    mockRequestPasswordReset.mockRejectedValue(new Error("User not found"));
    const user = userEvent.setup();
    render(<ForgotPassword />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "nonexistent@example.com",
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/if an account exists/i)).toBeInTheDocument();
    });
  });

  it("shows connection error when fetch fails", async () => {
    mockRequestPasswordReset.mockRejectedValue(new Error("Failed to fetch"));
    const user = userEvent.setup();
    render(<ForgotPassword />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com",
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });
  });

  it("renders the shared auth shell footer links", () => {
    render(<ForgotPassword />);
    expect(screen.getByText("Privacy").closest("a")).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByText("Terms").closest("a")).toHaveAttribute(
      "href",
      "/terms",
    );
  });

  it("submit button has full-width class", () => {
    render(<ForgotPassword />);
    const button = screen.getByRole("button", { name: /send reset link/i });
    expect(button).toHaveClass("w-full");
  });
});
