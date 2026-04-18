import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleNotch, Key, ArrowRight } from "@phosphor-icons/react";
import { authClient } from "../lib/auth-client";
import { PublicAuthShell } from "@/components/public-site/PublicAuthShell";
import {
  AuthNotice,
  authInputClass,
  authLabelClass,
} from "@/components/public-site/AuthFormPrimitives";

export function ResetPassword() {
  const token =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token")
      : null;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const errors: { password?: string; confirm?: string } = {};

    if (newPassword.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (newPassword !== confirmPassword) {
      errors.confirm = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword,
        token: token!,
      });

      if (resetError) {
        setError(
          "This reset link has expired or is invalid. Please request a new one.",
        );
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("[ResetPassword] Error:", err);
      setError(
        "This reset link has expired or is invalid. Please request a new one.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <PublicAuthShell
        header={
          <>
            <p className="public-kicker text-primary">Password reset</p>
            <h1 className="mt-4 font-headline text-3xl font-semibold tracking-[-0.05em] text-on-surface">
              Invalid or missing reset link
            </h1>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              This password reset link is invalid or has expired.
            </p>
          </>
        }
        footer={
          <>
            <span>© {new Date().getFullYear()} StrataDash</span>
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-primary"
            >
              Terms
            </Link>
          </>
        }
        visualMode="auth"
        visualEyebrow="Recovery state"
        visualTitle="Handle invalid reset links without breaking the system."
        visualDescription="Missing or expired reset tokens still land in the same public auth shell so the experience stays coherent."
        visualPoints={[
          "Clear error state with next action",
          "Immediate path back to the request flow",
          "No separate legacy auth view for edge cases",
        ]}
      >
        <div className="space-y-5">
          <AuthNotice tone="error" title="Invalid link">
            The reset token is missing from the URL. Please request a new
            password reset link.
          </AuthNotice>

          <Link
            href="/forgot-password"
            className="public-button-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Request a new reset link
            <ArrowRight size={18} weight="bold" />
          </Link>

          <div className="rounded-[24px] bg-surface-container-low px-4 py-4 text-sm leading-7 text-on-surface-variant">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-on-surface"
            >
              <ArrowLeft size={16} weight="bold" />
              Back to login
            </Link>
          </div>
        </div>
      </PublicAuthShell>
    );
  }

  return (
    <PublicAuthShell
      header={
        <>
          <p className="public-kicker text-primary">Password reset</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Key size={18} weight="bold" />
            </span>
            <h1 className="font-headline text-3xl font-semibold tracking-[-0.05em] text-on-surface">
              {isSuccess ? "Password reset complete" : "Set new password"}
            </h1>
          </div>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            {isSuccess
              ? "You can now log in with your new password."
              : "Enter your new password below."}
          </p>
        </>
      }
      footer={
        <>
          <span>© {new Date().getFullYear()} StrataDash</span>
          <Link
            href="/privacy"
            className="transition-colors hover:text-primary"
          >
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-primary">
            Terms
          </Link>
        </>
      }
      visualMode="auth"
      visualEyebrow="Secure recovery"
      visualTitle="Recovery keeps the same product posture."
      visualDescription="Resetting a password should feel like part of the product experience, not a detached utility page."
      visualPoints={[
        "Field validation stays inline and explicit",
        "Expired links surface a clear follow-up action",
        "Successful resets hand users back to sign-in cleanly",
      ]}
    >
      <div className="space-y-5">
        {isSuccess ? (
          <>
            <AuthNotice tone="success" title="Success">
              Your password has been reset successfully.
            </AuthNotice>
            <Link
              href="/login"
              className="public-button-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Back to login
              <ArrowRight size={18} weight="bold" />
            </Link>
          </>
        ) : (
          <>
            {error ? (
              <AuthNotice tone="error" title="Reset failed">
                <>
                  <span>{error}</span>
                  <Link
                    href="/forgot-password"
                    className="mt-2 inline-flex font-semibold text-primary transition-colors hover:text-on-surface"
                  >
                    Request a new reset link
                  </Link>
                </>
              </AuthNotice>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="new-password" className={authLabelClass}>
                  New password
                </label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  disabled={isLoading}
                  className={authInputClass}
                />
                {fieldErrors.password ? (
                  <p className="mt-2 text-sm text-error">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="confirm-password" className={authLabelClass}>
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (fieldErrors.confirm) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirm: undefined,
                      }));
                    }
                  }}
                  disabled={isLoading}
                  className={authInputClass}
                />
                {fieldErrors.confirm ? (
                  <p className="mt-2 text-sm text-error">
                    {fieldErrors.confirm}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="public-button-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <CircleNotch size={18} className="animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>

            <div className="rounded-[24px] bg-surface-container-low px-4 py-4 text-sm leading-7 text-on-surface-variant">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-on-surface"
              >
                <ArrowLeft size={16} weight="bold" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </PublicAuthShell>
  );
}
