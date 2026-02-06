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
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:5174",
    ...(process.env.VITE_APP_URL ? [process.env.VITE_APP_URL] : []),
  ],
});

export type Auth = typeof auth;
