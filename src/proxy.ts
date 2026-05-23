import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

export function proxy(req: NextRequest) {
  return (auth as any)(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
