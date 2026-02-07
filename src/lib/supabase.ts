/**
 * Supabase Client Configuration
 *
 * MIGRATION NOTE (2025-01): This module uses `createBrowserClient` from @supabase/ssr
 * which stores sessions in cookies instead of localStorage. This change was made to
 * enable cross-subdomain authentication (session sharing between district subdomains).
 *
 * If upgrading from a previous version that used `createClient` (localStorage-backed),
 * existing user sessions will be invalidated and users will need to re-login.
 */
import { createBrowserClient } from '@supabase/ssr';
import { getCookieDomain } from './cookie-domain';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export { getCookieDomain };

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    ...(getCookieDomain() && { domain: getCookieDomain() }),
    path: '/',
    sameSite: 'lax',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  },
});

export default supabase;