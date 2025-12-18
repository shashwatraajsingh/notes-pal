import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db/prisma";
import { deviceFingerprintingPlugin } from "./plugins/device-fingerprinting";

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "https://notes-pal-rtl9.vercel.app",
    // Add more Vercel preview URLs or your custom domain here
  ],
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    cookiePrefix: "notes-buddy",
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30,
    },
  },
  plugins: [deviceFingerprintingPlugin()],
});
