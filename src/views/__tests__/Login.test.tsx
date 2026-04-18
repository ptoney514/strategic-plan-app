import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test/setup";
import { Login } from "../Login";

const mockLogin = vi.fn();
const mockSendVerificationOtp = vi.fn();
const mockSignInEmailOtp = vi.fn();

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    login: (...args: unknown[]) => mockLogin(...args),
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
      emailOtp: (...args: unknown[]) => mockSignInEmailOtp(...args),
    },
  },
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "leader@district.org",
          name: "District Leader",
          image: null,
          isSystemAdmin: false,
        },
      },
    });
    mockSendVerificationOtp.mockResolvedValue({ error: null });
    mockSignInEmailOtp.mockResolvedValue({
      error: null,
      data: {
        user: {
          id: "user-1",
          email: "leader@district.org",
          name: "District Leader",
          image: null,
          isSystemAdmin: false,
        },
      },
    });
  });

  it("renders password mode by default", () => {
    render(<Login />);

    expect(screen.getByText("Sign in to StrataDash")).toBeInTheDocument();
    expect(
      screen.getByText(/use your work email and password/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
  });

  it("shows forgot-password link in password mode", () => {
    render(<Login />);

    expect(screen.getByText(/forgot password/i).closest("a")).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("calls password login with normalized email", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/work email/i), "Leader@District.org");
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
      "secret-pass",
    );
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "leader@district.org",
        "secret-pass",
      );
    });
  });

  it("switches to sign-in code mode", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole("tab", { name: /sign-in code/i }));

    expect(
      screen.getByText(/we'll send a one-time sign-in code/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send code/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
  });

  it("moves to the verification step after sending a code", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole("tab", { name: /sign-in code/i }));
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

  it("resends the code from verification step", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole("tab", { name: /sign-in code/i }));
    await user.type(
      screen.getByLabelText(/work email/i),
      "leader@district.org",
    );
    await user.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /resend code/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /resend code/i }));

    await waitFor(() => {
      expect(mockSendVerificationOtp).toHaveBeenCalledTimes(2);
    });
  });

  it("clears code-only state when switching back to password mode", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole("tab", { name: /sign-in code/i }));
    await user.type(
      screen.getByLabelText(/work email/i),
      "leader@district.org",
    );
    await user.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: /^password$/i }));

    expect(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/verification code/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resend code/i)).not.toBeInTheDocument();
  });
});
