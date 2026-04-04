"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { authClient } from "../lib/auth-client";
import { PublicAuthShell } from "@/components/public-site/PublicAuthShell";
import {
  AuthNotice,
  authInputClass,
  authLabelClass,
} from "@/components/public-site/AuthFormPrimitives";

export function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({ email, password, name });

      if (result.error) {
        setError(result.error.message || "Signup failed. Please try again.");
        return;
      }

      const redirectTo = searchParams.get("redirect") || "/welcome";
      router.replace(redirectTo);
    } catch (err) {
      console.error("[Signup] Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicAuthShell
      header={
        <>
          <p className="public-kicker text-primary">Create workspace access</p>
          <h1 className="mt-4 font-headline text-3xl font-semibold tracking-[-0.05em] text-on-surface">
            Create your account
          </h1>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Set up your StrataDash account and move into the planning workspace
            with a cleaner, district-ready authentication surface.
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
      visualMode="editor"
      visualEyebrow="Shared product language"
      visualTitle="Keep account setup inside the same public system."
      visualDescription="Signup now sits inside the same visual grammar as sign-in, legal, pricing, and the landing surface."
      visualPoints={[
        "Consistent tone and spacing across every public route",
        "Cleaner onboarding handoff from marketing into product",
        "No separate auth design system drifting out of sync",
      ]}
    >
      <div className="space-y-5">
        {error ? (
          <AuthNotice tone="error" title="Signup error">
            {error}
          </AuthNotice>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className={authLabelClass}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isLoading}
              className={authInputClass}
            />
          </div>

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
              disabled={isLoading}
              className={authInputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={authLabelClass}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              className={authInputClass}
            />
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
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isLoading}
              className={authInputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="public-button-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={18} weight="bold" />
              </>
            )}
          </button>
        </form>

        <div className="rounded-[24px] bg-surface-container-low px-4 py-4 text-sm leading-7 text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary transition-colors hover:text-on-surface"
          >
            Sign in
          </Link>
        </div>
      </div>
    </PublicAuthShell>
  );
}
