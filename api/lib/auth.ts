import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import * as schema from "./schema/index.js";
import { sendEmail } from "./email.js";
import { passwordResetEmailHtml } from "./email-templates.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your StrataDash password",
        html: passwordResetEmailHtml(url),
      });
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
  },
  user: {
    additionalFields: {
      isSystemAdmin: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  trustedOrigins: (request) => {
    const origins = [
      "https://stratadash.org",
      "https://www.stratadash.org",
    ];

    // Dev-only origins — not in production
    if (!process.env.VERCEL || process.env.VERCEL_ENV === 'development') {
      origins.push("http://localhost:5173", "http://localhost:5174", "http://lvh.me:5174");
    }

    if (process.env.VITE_APP_URL) {
      origins.push(process.env.VITE_APP_URL);
    }
    // Allow any subdomain of lvh.me for local dev
    const origin = request?.headers.get("origin");
    if (origin && /^https?:\/\/.*\.lvh\.me:5174$/.test(origin)) {
      origins.push(origin);
    }
    // Allow any subdomain of stratadash.org for production
    if (origin && /^https:\/\/.*\.stratadash\.org$/.test(origin)) {
      origins.push(origin);
    }
    // Allow this project's Vercel preview deployment URLs
    if (process.env.VERCEL_URL) {
      origins.push(`https://${process.env.VERCEL_URL}`);
    }
    if (process.env.VERCEL_BRANCH_URL) {
      origins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
    }
    return origins;
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.BETTER_AUTH_COOKIE_DOMAIN,
    },
  },
});

export type Auth = typeof auth;
