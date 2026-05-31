import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16 proxy (replaces middleware.ts) — edge-safe, no DB imports
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
