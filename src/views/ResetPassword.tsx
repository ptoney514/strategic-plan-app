import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '../lib/auth-client';
import { AlertCircle, Loader2, CheckCircle, KeyRound } from 'lucide-react';

export function ResetPassword() {
  const token = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const errors: { password?: string; confirm?: string } = {};

    if (newPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
        setError('This reset link has expired or is invalid. Please request a new one.');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      setError('This reset link has expired or is invalid. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  // No token present — show error state
  if (!token) {
    return (
      <div className="flex min-h-screen w-full bg-white text-slate-900 antialiased">
        <style>{`
          .fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
          @keyframes fadeIn { to { opacity: 1; } }
        `}</style>

        {/* Left Side */}
        <div className="flex flex-1 flex-col px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 pt-12 pb-12 relative justify-center">
          <div className="mx-auto w-full max-w-sm lg:w-96 fade-in">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="h-10 w-10 overflow-hidden rounded-lg shadow-xs">
                <img
                  src="/assets/stratadash-logo.png"
                  alt="StrataDash"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-semibold tracking-tight text-slate-900">StrataDash</span>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Invalid or missing reset link
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <div className="mt-10">
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-600 font-medium">Invalid Link</p>
                  <p className="text-sm text-red-500 mt-1">
                    The reset token is missing from the URL. Please request a new password reset link.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/forgot-password"
                  className="flex w-full justify-center items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-xs hover:bg-slate-800 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-md"
                >
                  Request a new reset link
                </Link>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="mt-16 lg:hidden text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} StrataDash.
          </div>
        </div>

        {/* Right Side: Branding */}
        <div className="relative hidden w-0 flex-1 lg:block bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div
            className="flex flex-col fade-in text-center h-full p-12 relative items-center justify-center z-10"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex flex-col items-center gap-8 max-w-lg">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl blur-sm opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-indigo-950 ring-1 ring-white/10 shadow-2xl">
                  <img
                    src="/assets/stratadash-logo.png"
                    alt="StrataDash Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold tracking-tight text-white">StrataDash</h1>
                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                  The intelligent strategic planning platform designed for K-12 Districts.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/50" />
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/20" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-10 left-0 right-0 text-center">
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase opacity-60">
              Empowering Education Leadership
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-white text-slate-900 antialiased">
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { to { opacity: 1; } }
      `}</style>

      {/* Left Side: Reset Password Form */}
      <div className="flex flex-1 flex-col px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 pt-12 pb-12 relative justify-center">
        <div className="mx-auto w-full max-w-sm lg:w-96 fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 overflow-hidden rounded-lg shadow-xs">
              <img
                src="/assets/stratadash-logo.png"
                alt="StrataDash"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">StrataDash</span>
          </div>

          {isSuccess ? (
            /* Success State */
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Password reset complete
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  You can now log in with your new password.
                </p>
              </div>

              <div className="mt-10">
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-700 font-medium">Success</p>
                    <p className="text-sm text-green-600 mt-1">
                      Your password has been reset successfully.
                    </p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="flex w-full justify-center items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-xs hover:bg-slate-800 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-md"
                >
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            /* Form State */
            <>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <KeyRound className="w-6 h-6 text-slate-400" />
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Set new password
                  </h2>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Enter your new password below.
                </p>
              </div>

              <div className="mt-10">
                {/* Error Alert */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-600 font-medium">Reset Failed</p>
                      <p className="text-sm text-red-500 mt-1">{error}</p>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors mt-2 inline-block"
                      >
                        Request a new reset link
                      </Link>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password Field */}
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium leading-6 text-slate-700">
                      New password
                    </label>
                    <div className="mt-2">
                      <input
                        id="new-password"
                        name="new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        disabled={isLoading}
                        className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-xs ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow disabled:opacity-50"
                      />
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-slate-700">
                      Confirm password
                    </label>
                    <div className="mt-2">
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirm) setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                        }}
                        disabled={isLoading}
                        className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-xs ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow disabled:opacity-50"
                      />
                    </div>
                    {fieldErrors.confirm && (
                      <p className="mt-1.5 text-sm text-red-600">{fieldErrors.confirm}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full justify-center items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-xs hover:bg-slate-800 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        'Reset password'
                      )}
                    </button>
                  </div>
                </form>

                {/* Back to Login Link */}
                <div className="mt-8 text-center">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile Footer */}
        <div className="mt-16 lg:hidden text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} StrataDash.
        </div>
      </div>

      {/* Right Side: Branding */}
      <div className="relative hidden w-0 flex-1 lg:block bg-slate-950 overflow-hidden">
        {/* Grid Background with Vignette Mask */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Subtle Purple/Indigo Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div
          className="flex flex-col fade-in text-center h-full p-12 relative items-center justify-center z-10"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex flex-col items-center gap-8 max-w-lg">
            {/* Logo Container with Glow */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl blur-sm opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-indigo-950 ring-1 ring-white/10 shadow-2xl">
                <img
                  src="/assets/stratadash-logo.png"
                  alt="StrataDash Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-tight text-white">StrataDash</h1>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                The intelligent strategic planning platform designed for K-12 Districts.
              </p>
            </div>

            {/* Decorative Dots */}
            <div className="flex gap-2 mt-4">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/50" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/20" />
            </div>
          </div>
        </div>

        {/* Bottom Legal Text */}
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase opacity-60">
            Empowering Education Leadership
          </p>
        </div>
      </div>
    </div>
  );
}
