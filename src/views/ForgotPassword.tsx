import Link from "next/link";
import { ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { PublicAuthShell } from "@/components/public-site/PublicAuthShell";
import {
  AuthNotice,
  authInputClass,
  authLabelClass,
} from "@/components/public-site/AuthFormPrimitives";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      setIsSubmitted(true);
    } catch (err) {
      if (err instanceof Error && err.message.includes("fetch")) {
        setError(
          "Unable to connect. Please check your internet connection and try again.",
        );
      } else {
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicAuthShell
      header={
        <>
          <p className="public-kicker text-primary">Password reset</p>
          <h1 className="mt-4 font-headline text-3xl font-semibold tracking-[-0.05em] text-on-surface">
            Forgot your password?
          </h1>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Enter your email and we&apos;ll send you a reset link.
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
      visualEyebrow="Reset workflow"
      visualTitle="Keep recovery readable and support-safe."
      visualDescription="The reset request surface preserves non-enumerating messaging while matching the rest of the public system."
      visualPoints={[
        "No user enumeration in success messaging",
        "Same district-facing visual system as sign-in",
        "Clear handoff back into the secure workspace",
      ]}
    >
      <div className="space-y-5">
        {error ? (
          <AuthNotice tone="error" title="Error">
            {error}
          </AuthNotice>
        ) : null}

        {isSubmitted ? (
          <AuthNotice tone="success" title="Check your email">
            If an account exists with that email, we&apos;ve sent a password
            reset link.
          </AuthNotice>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className={authLabelClass}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading || isSubmitted}
              className={authInputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSubmitted}
            className="public-button-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
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
      </div>
    </PublicAuthShell>
  );
}
