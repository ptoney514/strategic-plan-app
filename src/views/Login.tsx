"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { useAuth } from "../contexts/AuthContext";
import { useSubdomain } from "../contexts/SubdomainContext";
import { authClient } from "../lib/auth-client";
import { getSubdomainUrl } from "../lib/subdomain";
import { mapBetterAuthUser, type AuthUser } from "../lib/types/auth";
import { PublicAuthShell } from "@/components/public-site/PublicAuthShell";
import {
  AuthNotice,
  authInputClass,
  authLabelClass,
} from "@/components/public-site/AuthFormPrimitives";

function usePublicRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { type: subdomainType } = useSubdomain();
  const redirectParam = searchParams.get("redirect");

  return useCallback(
    (rawUser: Parameters<typeof mapBetterAuthUser>[0]) => {
      const user: AuthUser = mapBetterAuthUser(rawUser);

      if (subdomainType === "admin") {
        if (user.isSystemAdmin) {
          router.replace("/");
        } else {
          window.location.href = getSubdomainUrl("root");
        }
        return;
      }

      if (subdomainType !== "root" && !redirectParam) {
        window.location.href = `${getSubdomainUrl("root")}/dashboard`;
        return;
      }

      router.replace(redirectParam || "/dashboard");
    },
    [redirectParam, router, subdomainType],
  );
}

export function Login() {
  const { isAuthenticated, user } = useAuth();
  const redirectAfterAuth = usePublicRedirect();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    redirectAfterAuth(user);
  }, [isAuthenticated, redirectAfterAuth, user]);

  if (isAuthenticated) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const canSubmitEmail = normalizedEmail.length > 0;
  const canSubmitCode = otp.trim().length > 0;

  const handleSendCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!canSubmitEmail) {
      setError("Please enter your work email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "sign-in",
      });

      if (response.error) {
        throw new Error(
          response.error.message || "Failed to send sign-in code.",
        );
      }

      setOtp("");
      setStep("code");
    } catch (err) {
      console.error("[Login] send code error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send sign-in code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!canSubmitCode) {
      setError("Please enter the code we emailed you.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authClient.signIn.emailOtp({
        email: normalizedEmail,
        otp: otp.trim(),
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to verify code.");
      }

      const rawUser = response.data?.user;
      if (!rawUser) {
        throw new Error("Login failed. Please try again.");
      }

      redirectAfterAuth(rawUser as Parameters<typeof mapBetterAuthUser>[0]);
    } catch (err) {
      console.error("[Login] verify code error:", err);
      setError(err instanceof Error ? err.message : "Failed to verify code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep("email");
    setOtp("");
    setError("");
  };

  const handleResendCode = async () => {
    if (!canSubmitEmail || isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "sign-in",
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to resend code.");
      }

      setOtp("");
    } catch (err) {
      console.error("[Login] resend code error:", err);
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLabel = step === "email" ? "Send code" : "Sign in";
  const formHandler = step === "email" ? handleSendCode : handleVerifyCode;

  return (
    <PublicAuthShell
      header={
        <>
          <p className="public-kicker text-primary">
            {step === "email" ? "Secure access" : "Verification"}
          </p>
          <h1 className="mt-4 font-headline text-3xl font-semibold tracking-[-0.05em] text-on-surface">
            Sign in to StrataDash
          </h1>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            {step === "email"
              ? "Enter your work email to receive a secure sign-in code."
              : `We sent a code to ${normalizedEmail}. Enter it below to finish signing in.`}
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
      visualEyebrow="Protected workspace"
      visualTitle="Route leaders to the correct planning environment."
      visualDescription="The sign-in flow stays lightweight for district users while preserving the redirect and subdomain rules already in the product."
      visualPoints={[
        "Email-code sign-in for standard access",
        "Support-safe messaging around auth errors",
        "Correct redirect behavior for root and admin workspaces",
      ]}
    >
      <div className="space-y-5">
        {error ? (
          <AuthNotice tone="error" title="Authentication error">
            {error}
          </AuthNotice>
        ) : null}

        <form onSubmit={formHandler} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className={authLabelClass}>
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@school-district.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading || step === "code"}
              className={authInputClass}
            />
            <p className="text-xs leading-6 text-on-surface-variant">
              Use the district or organization email connected to your
              workspace.
            </p>
          </div>

          {step === "code" ? (
            <div className="space-y-2">
              <label htmlFor="otp" className={authLabelClass}>
                Verification code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                placeholder="123456"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                disabled={isLoading}
                maxLength={6}
                className={authInputClass}
              />
              <p className="text-xs leading-6 text-on-surface-variant">
                The code is short-lived. Request another one if it has expired.
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={
              isLoading || (step === "email" ? !canSubmitEmail : !canSubmitCode)
            }
            className="public-button-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                {step === "email" ? "Sending code..." : "Signing in..."}
              </>
            ) : (
              <>
                {buttonLabel}
                <ArrowRight size={18} weight="bold" />
              </>
            )}
          </button>
        </form>

        {step === "code" ? (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-sm">
            <button
              type="button"
              onClick={handleStartOver}
              className="font-semibold text-on-surface-variant transition-colors hover:text-primary"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading || !canSubmitEmail}
              className="font-semibold text-primary transition-colors hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
        ) : null}

        <div className="rounded-[24px] bg-surface-container-low px-4 py-4 text-sm leading-7 text-on-surface-variant">
          New to StrataDash?{" "}
          <a
            href="mailto:support@stratadash.org?subject=StrataDash%20access%20request"
            className="font-semibold text-primary transition-colors hover:text-on-surface"
          >
            Contact your administrator
          </a>{" "}
          to request access.
        </div>
      </div>
    </PublicAuthShell>
  );
}
