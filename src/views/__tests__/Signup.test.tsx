import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test/setup";
import { Signup } from "../Signup";

const mockSignUpEmail = vi.fn();
const mockReplace = vi.fn();

vi.mock("../../lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: (...args: unknown[]) => mockSignUpEmail(...args),
    },
  },
}));

vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      replace: mockReplace,
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => ({
      get: vi.fn().mockReturnValue(null),
      toString: vi.fn().mockReturnValue(""),
    }),
  };
});

describe("Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUpEmail.mockResolvedValue({ error: null });
  });

  it("renders the account creation heading", () => {
    render(<Signup />);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("renders the signup fields and button", () => {
    render(<Signup />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("submits signup data and redirects to welcome", async () => {
    const user = userEvent.setup();
    render(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Fields");
    await user.type(
      screen.getByLabelText(/email address/i),
      "jordan@district.org",
    );
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        email: "jordan@district.org",
        name: "Jordan Fields",
        password: "password123",
      });
    });

    expect(mockReplace).toHaveBeenCalledWith("/welcome");
  });
});
