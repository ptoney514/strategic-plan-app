'use client'
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubdomain } from '../contexts/SubdomainContext';
import { authClient } from '../lib/auth-client';
import { getSubdomainUrl } from '../lib/subdomain';
import { mapBetterAuthUser, type AuthUser } from '../lib/types/auth';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';

function usePublicRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { type: subdomainType } = useSubdomain();
  const redirectParam = searchParams.get('redirect');

  return useCallback(
    (rawUser: Parameters<typeof mapBetterAuthUser>[0]) => {
      const user: AuthUser = mapBetterAuthUser(rawUser);

      if (subdomainType === 'admin') {
        if (user.isSystemAdmin) {
          router.replace('/');
        } else {
          window.location.href = getSubdomainUrl('root');
        }
        return;
      }

      if (subdomainType !== 'root' && !redirectParam) {
        window.location.href = `${getSubdomainUrl('root')}/dashboard`;
        return;
      }

      router.replace(redirectParam || '/dashboard');
    },
    [redirectParam, router, subdomainType],
  );
}

export function Login() {
  const { isAuthenticated, user } = useAuth();
  const redirectAfterAuth = usePublicRedirect();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState('');
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
    setError('');

    if (!canSubmitEmail) {
      setError('Please enter your work email.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: 'sign-in',
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send sign-in code.');
      }

      setOtp('');
      setStep('code');
    } catch (err) {
      console.error('[Login] send code error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send sign-in code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!canSubmitCode) {
      setError('Please enter the code we emailed you.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authClient.signIn.emailOtp({
        email: normalizedEmail,
        otp: otp.trim(),
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to verify code.');
      }

      const rawUser = response.data?.user;
      if (!rawUser) {
        throw new Error('Login failed. Please try again.');
      }

      redirectAfterAuth(rawUser as Parameters<typeof mapBetterAuthUser>[0]);
    } catch (err) {
      console.error('[Login] verify code error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep('email');
    setOtp('');
    setError('');
  };

  const handleResendCode = async () => {
    if (!canSubmitEmail || isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: 'sign-in',
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to resend code.');
      }

      setOtp('');
    } catch (err) {
      console.error('[Login] resend code error:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLabel = step === 'email' ? 'Send Code' : 'Sign in';
  const formHandler = step === 'email' ? handleSendCode : handleVerifyCode;

  return (
    <div className="flex min-h-screen bg-background text-on-surface antialiased">
      <section className="relative flex w-full items-center justify-center overflow-hidden bg-background px-6 py-10 lg:w-[45%] lg:px-16">
        <div className="absolute left-6 top-6 lg:left-12 lg:top-12">
          <span className="font-headline text-2xl font-black tracking-tighter text-on-surface">
            StrataDash
          </span>
        </div>

        <div className="w-full max-w-md pt-12 lg:pt-0">
          <div className="rounded-[28px] bg-surface p-8 editorial-shadow md:p-10">
            <header className="mb-8">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
                Sign in to StrataDash
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                {step === 'email'
                  ? 'Enter your work email to receive a secure sign-in code.'
                  : `We sent a code to ${normalizedEmail}. Enter it below to finish signing in.`}
              </p>
            </header>

            {error ? (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-error/20 bg-error-container/60 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                <div>
                  <p className="font-semibold text-error">Authentication error</p>
                  <p className="mt-1 text-sm text-error">{error}</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={formHandler} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="font-label text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant"
                >
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
                  disabled={isLoading || step === 'code'}
                  className="w-full rounded-full border border-transparent bg-surface-container-high px-5 py-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/60 focus:border-primary/20 focus:bg-surface focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>

              {step === 'code' ? (
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="font-label text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant"
                  >
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
                    className="w-full rounded-full border border-transparent bg-surface-container-high px-5 py-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/60 focus:border-primary/20 focus:bg-surface focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || (step === 'email' ? !canSubmitEmail : !canSubmitCode)}
                className="tactile-button inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-headline text-lg font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {step === 'email' ? 'Sending code...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {buttonLabel}
                    <MaterialIcon icon="arrow_forward" size={18} />
                  </>
                )}
              </button>
            </form>

            {step === 'code' ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
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
                  className="font-semibold text-primary transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Resend code
                </button>
              </div>
            ) : null}

            <div className="mt-10 border-t border-black/5 pt-8">
              <p className="text-sm leading-relaxed text-on-surface-variant">
                New to StrataDash?{' '}
                <a
                  href="mailto:support@stratadash.org?subject=StrataDash%20access%20request"
                  className="font-semibold text-primary transition-colors hover:underline"
                >
                  Contact your administrator
                </a>{' '}
                to request access.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[10px] font-label uppercase tracking-[0.24em] text-on-surface-variant/60">
            <span>© {new Date().getFullYear()} StrataDash</span>
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </section>

      <section className="relative hidden w-full overflow-hidden bg-primary-container lg:flex lg:w-[55%]">
        <div className="absolute inset-0 bg-[url('/stitch/graphy.png')] opacity-10" />
        <div className="absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary blur-[120px] opacity-40" />
        <div className="absolute -bottom-[10%] left-[-10%] h-[80%] w-[80%] rounded-full bg-[#0f4671] blur-[150px] opacity-30" />

        <div className="relative z-10 flex w-full flex-col justify-center px-20">
          <div className="max-w-2xl">
            <h2 className="font-headline text-6xl font-black leading-[1.08] tracking-tighter text-white">
              Your strategic plan deserves better than a PDF.
            </h2>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-on-primary-container">
              Empowering school districts with interactive transparency and real-time progress
              tracking.
            </p>
          </div>

          <div className="mt-12">
            <div className="glass-panel relative rounded-2xl border border-white/10 p-8 shadow-[0_30px_60px_rgba(10,28,52,0.18)]">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <MaterialIcon icon="school" size={22} className="text-primary-fixed" />
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-on-surface">
                      Westside Community Schools
                    </h3>
                    <p className="font-mono text-xs text-on-surface-variant">
                      STRATEGIC PLAN 2024-2027
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-tertiary-fixed px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-on-tertiary-fixed-variant" />
                  <span className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-tertiary-fixed-variant">
                    Live monitoring
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-2xl bg-surface-container-low p-6">
                  <p className="mb-2 font-label text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                    Student achievement
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-primary">87.4%</span>
                    <span className="font-mono text-xs text-secondary">+2.1%</span>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-surface-container-highest">
                    <div className="h-full w-[87.4%] rounded-full bg-primary" />
                  </div>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-6">
                  <p className="mb-2 font-label text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                    Operational excellence
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-primary">92/100</span>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-surface-container-highest">
                    <div className="h-full w-[92%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-white/50 p-4">
                  <div className="flex items-center gap-3">
                    <MaterialIcon icon="verified" size={18} className="text-on-surface-variant" />
                    <span className="text-sm">Modernizing STEAM Labs (Phase 2)</span>
                  </div>
                  <span className="rounded-full bg-tertiary-fixed px-2 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-on-tertiary-fixed-variant">
                    On target
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/50 p-4">
                  <div className="flex items-center gap-3">
                    <MaterialIcon icon="schedule" size={18} className="text-on-surface-variant" />
                    <span className="text-sm">Dual-language immersion expansion</span>
                  </div>
                  <span className="rounded-full bg-secondary-fixed px-2 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-on-secondary-container">
                    Off track
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl border border-white/20 bg-white/85 p-4 shadow-[0_20px_40px_rgba(15,24,40,0.16)] lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  <MaterialIcon icon="trending_up" size={16} />
                </div>
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                    Transparency score
                  </p>
                  <p className="font-mono text-sm font-bold text-on-surface">Tier 1 exemplar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
