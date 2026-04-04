import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test/setup";
import { Login } from "../Login";

const mockSendVerificationOtp = vi.fn();

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));

vi.mock("../../contexts/SubdomainContext", () => ({
  useSubdomain: () => ({
    type: "root",
    slug: null,
  }),
}));

vi.mock("../../lib/auth-client", () => ({
  authClient: {
    emailOtp: {
      sendVerificationOtp: (...args: unknown[]) =>
        mockSendVerificationOtp(...args),
    },
    signIn: {
      emailOtp: vi.fn(),
    },
  },
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendVerificationOtp.mockResolvedValue({ error: null });
  });

  it("renders the sign-in heading and helper copy", () => {
    render(<Login />);

    expect(screen.getByText("Sign in to StrataDash")).toBeInTheDocument();
    expect(
      screen.getByText(
        /enter your work email to receive a secure sign-in code/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the email field and send code button", () => {
    render(<Login />);

    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send code/i }),
    ).toBeInTheDocument();
  });

  it("moves to the verification step after sending a code", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(
      screen.getByLabelText(/work email/i),
      "leader@district.org",
    );
    await user.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(mockSendVerificationOtp).toHaveBeenCalledWith({
        email: "leader@district.org",
        type: "sign-in",
      });
    });

    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^sign in$/i }),
    ).toBeInTheDocument();
  });
});
