// src/types/next-auth.d.ts
import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

interface ExtendedJWT extends JWT {
  user?: {
    id: string;
    email: string;
    name: string;
    profilePicture?: string | null;
  };
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      profilePicture?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    profilePicture?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends ExtendedJWT {}
}