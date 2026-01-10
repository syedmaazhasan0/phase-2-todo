/**
 * Better Auth server instance with JWT support.
 *
 * This server handles authentication (sign up, sign in) and generates JWT tokens
 * that can be validated by FastAPI backend.
 */

import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // Base URL for the auth server
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Secret key for JWT signing - must match backend
  secret: process.env.BETTER_AUTH_SECRET || "9LwoNRSxkGnLUquJlXdVmRCg3cIjSnhi",

  // Enable JWT plugin for token generation
  // JWT tokens are sent to FastAPI backend for validation
  jwt: {
    enabled: true,
    // Token expiration: 30 minutes (1800 seconds)
    expiresIn: 1800,
  },

  // Database configuration - use memory adapter for development
  // Note: In production, use a proper database adapter
  database: {
    adapter: "memory",
  },

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // Social providers (optional - enable as needed)
  socialProviders: {}, // Add providers like google, github as needed

  // Advanced options
  advanced: {
    generateId: () => {
      // Use crypto.randomUUID() for secure UUID generation
      return crypto.randomUUID();
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Account configuration
  account: {
    accountLinking: {
      enabled: false,
    },
  },
});

// Export for use in API routes
export type Auth = typeof auth;
