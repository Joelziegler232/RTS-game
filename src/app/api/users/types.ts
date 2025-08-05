// src/app/api/users/types.ts
import { JWT } from 'next-auth/jwt';

export interface ExtendedJWT extends JWT {
  user?: {
    id: string;
    email: string;
    name: string;
    profilePicture?: string | null;
  };
}