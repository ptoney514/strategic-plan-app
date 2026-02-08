import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema/index";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
      "http://localhost:5173",
      "http://localhost:5174",
      "http://lvh.me:5174",
    ];
    if (process.env.VITE_APP_URL) {
      origins.push(process.env.VITE_APP_URL);
    }
    // Allow any subdomain of lvh.me for local dev
    const origin = request?.headers.get("origin");
    if (origin && /^https?:\/\/.*\.lvh\.me:5174$/.test(origin)) {
      origins.push(origin);
    }
    return origins;
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.BETTER_AUTH_COOKIE_DOMAIN,
    },
    database: {
      generateId: "uuid",
    },
  },
});

export type Auth = typeof auth;
