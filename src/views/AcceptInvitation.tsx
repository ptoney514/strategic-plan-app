'use client'
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useValidateInvitation, useAcceptInvitation, useDeclineInvitation } from '../hooks/useInvitations';
import { authClient } from '../lib/auth-client';
import { buildSubdomainUrlWithPath } from '../lib/subdomain';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Building2 } from 'lucide-react';

type Tab = 'create' | 'signin';

function AuthForms({ email, onSuccess }: { email: string; onSuccess: () => void }) {
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>('create');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Signup fields
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState(email);
  const [loginPassword, setLoginPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setIsLoading(true);
    try {
      const result = await authClient.signUp.email({ email, password, name });
      if (result.error) { setError(result.error.message || 'Signup failed.'); return; }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-xs ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow disabled:opacity-50";

  return (
    <div className="mt-6">
      {/* Tabs */}
      <div className="flex rounded-lg p-1 mb-6" style={{ background: 'var(--editorial-surface, #f8fafc)' }}>
        <button
          onClick={() => { setTab('create'); setError(''); }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${tab === 'create' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Create Account
        </button>
        <button
          onClick={() => { setTab('signin'); setError(''); }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${tab === 'signin' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Sign In
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {tab === 'create' ? (
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="invite-name" className="block text-sm font-medium text-slate-700">Full name</label>
            <input id="invite-name" type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className={inputClass} />
          </div>
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700">Email</label>
            <input id="invite-email" type="email" value={email} disabled className={`${inputClass} bg-slate-50`} />
          </div>
          <div>
            <label htmlFor="invite-password" className="block text-sm font-medium text-slate-700">Password</label>
            <input id="invite-password" type="password" required placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className={inputClass} />
          </div>
          <div>
            <label htmlFor="invite-confirm" className="block text-sm font-medium text-slate-700">Confirm password</label>
            <input id="invite-confirm" type="password" required placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className={inputClass} />
          </div>
          <button type="submit" disabled={isLoading} className="flex w-full justify-center items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all disabled:opacity-50">
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</> : 'Create account'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">Email</label>
            <input id="login-email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isLoading} className={inputClass} />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
            <input id="login-password" type="password" required placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isLoading} className={inputClass} />
          </div>
          <button type="submit" disabled={isLoading} className="flex w-full justify-center items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all disabled:opacity-50">
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : 'Sign in'}
          </button>
        </form>
      )}
    </div>
  );
}

export function AcceptInvitation() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: invitation, isLoading, isError } = useValidateInvitation(token ?? '');
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();
  const [authComplete, setAuthComplete] = useState(false);

  const isReady = isAuthenticated || authComplete;

  const handleAccept = async () => {
    if (!token) return;
    try {
      await accept.mutateAsync(token);
      const adminUrl = buildSubdomainUrlWithPath('district', '/admin', invitation!.organization.slug);
      window.location.href = adminUrl;
    } catch (err) {
      console.error('[AcceptInvitation] Accept error:', err);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    try {
      await decline.mutateAsync(token);
      router.replace('/dashboard');
    } catch (err) {
      console.error('[AcceptInvitation] Decline error:', err);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)' }}>
        <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-xs text-center" style={{ borderColor: 'var(--editorial-border, #e2e8f0)' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Invalid Invitation</h1>
          <p className="mt-2 text-sm text-slate-500">This invitation link is invalid or has expired.</p>
          <Link href="/login" className="inline-block mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const isActing = accept.isPending || decline.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)' }}>
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { to { opacity: 1; } }
      `}</style>

      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 overflow-hidden rounded-lg shadow-xs">
            <img src="/assets/stratadash-logo.png" alt="StrataDash" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">StrataDash</span>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-xs" style={{ borderColor: 'var(--editorial-border, #e2e8f0)' }}>
          <h1 className="text-xl font-semibold tracking-tight text-center" style={{ color: 'var(--editorial-text-primary)', fontFamily: 'Playfair Display, serif' }}>
            You've been invited
          </h1>

          {/* Invitation Details */}
          <div className="mt-6 rounded-lg border p-4 flex items-center gap-4" style={{ borderColor: 'var(--editorial-border, #e2e8f0)', background: 'var(--editorial-surface, #f8fafc)' }}>
            <div className="shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-white flex items-center justify-center border" style={{ borderColor: 'var(--editorial-border, #e2e8f0)' }}>
              {invitation.organization.logo_url ? (
                <img src={invitation.organization.logo_url} alt={invitation.organization.name} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
                {invitation.organization.name}
              </p>
              <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--editorial-text-muted)' }}>
                Invited as {invitation.role}
              </p>
            </div>
          </div>

          {isReady ? (
            <>
              {/* Accept / Decline errors */}
              {(accept.isError || decline.isError) && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleDecline}
                  disabled={isActing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {decline.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isActing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ background: 'var(--editorial-accent-primary, #4f46e5)' }}
                >
                  {accept.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Accept Invitation
                </button>
              </div>
            </>
          ) : (
            <AuthForms email={invitation.email} onSuccess={() => setAuthComplete(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
