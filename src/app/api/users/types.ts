
import { JWT } from 'next-auth/jwt';

// Extensión del token JWT de NextAuth para incluir datos del usuario
export interface ExtendedJWT extends JWT {
  user?: {
    id: string;              
    email: string;           
    name: string;         
    profilePicture?: string | null;  
  };
}