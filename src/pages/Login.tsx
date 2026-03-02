import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubdomain } from '../contexts/SubdomainContext';
import { getSubdomainUrl } from '../lib/subdomain';
import { AlertCircle, Loader2 } from 'lucide-react';

interface LocationState {
  from?: string;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { type: subdomainType } = useSubdomain();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as LocationState)?.from;
      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');

      // On non-root subdomains, redirect to root domain dashboard
      if (subdomainType !== 'root' && !from && !redirectParam) {
        window.location.href = getSubdomainUrl('root') + '/dashboard';
        return;
      }

      const redirectUrl = from ? from + location.search : redirectParam || '/dashboard';
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, location.state, location.search, navigate, subdomainType]);

  // Show nothing while redirecting
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(email, password);
      const user = response.data.user;

      if (!user) {
        setError('Login failed. Please try again.');
        return;
      }

      // On admin subdomain, system admins stay, others go to root
      if (subdomainType === 'admin') {
        if (user.isSystemAdmin) {
          navigate(`/${location.search}`, { replace: true });
        } else {
          window.location.href = getSubdomainUrl('root');
        }
        return;
      }

      // Redirect to the intended destination or /dashboard
      // Users can access admin pages from the avatar menu
      const from = (location.state as LocationState)?.from;
      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');

      // On non-root subdomains (district), redirect to root domain dashboard
      if (subdomainType !== 'root' && !from && !redirectParam) {
        window.location.href = getSubdomainUrl('root') + '/dashboard';
        return;
      }

      const redirectUrl = from ? from + location.search : redirectParam || '/dashboard';
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      console.error('[Login] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Google OAuth temporarily disabled during Better Auth migration.
    // Will be re-enabled with socialProviders.google server config.
    setError('Google sign-in is temporarily unavailable. Please use email/password.');
  };

  return (
    <div className="flex min-h-screen w-full bg-white text-slate-900 antialiased">
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { to { opacity: 1; } }
      `}</style>

      {/* Left Side: Login Form */}
      <div className="flex flex-1 flex-col px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 pt-12 pb-12 relative justify-center">
        <div className="mx-auto w-full max-w-sm lg:w-96 fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 overflow-hidden rounded-lg shadow-sm">
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
              Log in to StrataDash
            </h2>
            <p className="mt-2 text-sm text-slate-500">Welcome back! Please enter your details.</p>
          </div>

          <div className="mt-10">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-600 font-medium">Authentication Error</p>
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-700">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-700">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-slate-400">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <div className="mt-8">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus-visible:ring-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="mt-16 lg:hidden text-center text-xs text-slate-400">
          © {new Date().getFullYear()} StrataDash.
        </div>
      </div>

      {/* Right Side: Branding */}
      <div className="relative hidden w-0 flex-1 lg:block bg-slate-950 overflow-hidden">
        {/* Grid Background with Vignette Mask */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Subtle Purple/Indigo Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div
          className="flex flex-col fade-in text-center h-full p-12 relative items-center justify-center z-10"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex flex-col items-center gap-8 max-w-lg">
            {/* Logo Container with Glow */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
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
