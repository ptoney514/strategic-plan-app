import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN && !Sentry.isInitialized()) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? 'development',
    beforeSend(event) {
      // Drop expected Better Auth session-expiry noise
      if (event.exception?.values?.some(v => v.value?.includes('session'))) {
        return null;
      }
      return event;
    },
  });
}

export { Sentry };
