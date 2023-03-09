import NextAuth from "next-auth/next";

declare module "next-auth" {
  interface Session {
    activeSubscription: string | null;
  }
}