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

type LoginMethod = "password" | "code";
type CodeStep = "request" | "verify";

function usePublicRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { type: subdomainType } = useSubdomain();
  const redirectParam = searchParams.get("redirect");

  return useCallback(
    (authenticatedUser: AuthUser) => {
      if (subdomainType === "admin") {
        if (authenticatedUser.isSystemAdmin) {
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
  const { isAuthenticated, login, user } = useAuth();
  const redirectAfterAuth = usePublicRedirect();
  const [method, setMethod] = useState<LoginMethod>("password");
  const [codeStep, setCodeStep] = useState<CodeStep>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
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
  const canSubmitPassword = normalizedEmail.length > 0 && password.length > 0;
  const canSubmitEmail = normalizedEmail.length > 0;
  const canSubmitCode = otp.trim().length > 0;

  const switchMethod = (nextMethod: LoginMethod) => {
    if (nextMethod === method) return;

    setMethod(nextMethod);
    setCodeStep("request");
    setPassword("");
    setOtp("");
    setError("");
  };

  const handlePasswordSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!normalizedEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(normalizedEmail, password);
      const authenticatedUser = response.data.user;

      if (!authenticatedUser) {
        throw new Error("Login failed. Please try again.");
      }

      redirectAfterAuth(authenticatedUser);
    } catch (err) {
      console.error("[Login] password sign-in error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      setCodeStep("verify");
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

      redirectAfterAuth(
        mapBetterAuthUser(rawUser as Parameters<typeof mapBetterAuthUser>[0]),
      );
    } catch (err) {
      console.error("[Login] verify code error:", err);
      setError(err instanceof Error ? err.message : "Failed to verify code.");
    } finally {
      setIsLoading(false);
    }
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

  const isPasswordMode = method === "password";
  const submitLabel = isPasswordMode
    ? "Sign in"
    : codeStep === "request"
      ? "Send code"
      : "Sign in";
  const submitHandler = isPasswordMode
    ? handlePasswordSignIn
    : codeStep === "request"
      ? handleSendCode
      : handleVerifyCode;

  const headerKicker = isPasswordMode
    ? "Secure access"
    : codeStep === "request"
      ? "Sign-in code"
      : "Verification";

  const headerCopy = isPasswordMode
    ? "Use your work email and password. Prefer a one-time code? Switch to sign-in code instead."
    : codeStep === "request"
      ? "Enter your work email to receive a secure sign-in code."
      : `We sent a code to ${normalizedEmail}. Enter it below to finish signing in.`;

  return (
    <PublicAuthShell
      header={
        <>
          <p className="public-kicker text-primary">{headerKicker}</p>
          <h1 className="mt-4 font-headline text-3xl font-semibold tracking-[-0.05em] text-on-surface">
            Sign in to StrataDash
          </h1>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            {headerCopy}
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
      visualDescription="Use password sign-in by default, or fall back to a one-time email code, without changing the redirect and subdomain rules already in the product."
      visualPoints={[
        "Password sign-in with optional email code",
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

        <div
          className="grid grid-cols-2 gap-2 rounded-[24px] bg-surface-container-low p-1.5"
          role="tablist"
          aria-label="Sign-in methods"
        >
          <button
            id="password-tab"
            type="button"
            role="tab"
            aria-selected={isPasswordMode}
            aria-controls="password-panel"
            onClick={() => switchMethod("password")}
            className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition-colors ${
              isPasswordMode
                ? "bg-white text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Password
          </button>
          <button
            id="code-tab"
            type="button"
            role="tab"
            aria-selected={!isPasswordMode}
            aria-controls="code-panel"
            onClick={() => switchMethod("code")}
            className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition-colors ${
              !isPasswordMode
                ? "bg-white text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Sign-in code
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
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
              disabled={isLoading || (!isPasswordMode && codeStep === "verify")}
              className={authInputClass}
            />
            <p className="text-xs leading-6 text-on-surface-variant">
              Use the district or organization email connected to your
              workspace.
            </p>
          </div>

          {isPasswordMode ? (
            <div id="password-panel" role="tabpanel" aria-labelledby="password-tab">
              <div className="space-y-2">
                <label htmlFor="password" className={authLabelClass}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  className={authInputClass}
                />
              </div>

              <div className="mt-3 flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-primary transition-colors hover:text-on-surface"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          ) : (
            <div id="code-panel" role="tabpanel" aria-labelledby="code-tab">
              {codeStep === "verify" ? (
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
                    The code is short-lived. Request another one if it has
                    expired.
                  </p>
                </div>
              ) : (
                <div className="rounded-[24px] bg-surface-container-low px-4 py-4 text-sm leading-7 text-on-surface-variant">
                  We&apos;ll send a one-time sign-in code to your work email.
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isLoading ||
              (isPasswordMode
                ? !canSubmitPassword
                : codeStep === "request"
                  ? !canSubmitEmail
                  : !canSubmitCode)
            }
            className="public-button-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                {isPasswordMode
                  ? "Signing in..."
                  : codeStep === "request"
                    ? "Sending code..."
                    : "Signing in..."}
              </>
            ) : (
              <>
                {submitLabel}
                <ArrowRight size={18} weight="bold" />
              </>
            )}
          </button>
        </form>

        {!isPasswordMode && codeStep === "verify" ? (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setCodeStep("request");
                setOtp("");
                setError("");
              }}
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
