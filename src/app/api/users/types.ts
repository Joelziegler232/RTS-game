// src/app/api/users/types.ts
import { JWT } from 'next-auth/jwt';

// Extensión del token JWT de NextAuth para incluir datos del usuario
export interface ExtendedJWT extends JWT {
  user?: {
    id: string;              // ID del usuario (string)
    email: string;           // Email del usuario
    name: string;            // Nombre completo o nombre de usuario
    profilePicture?: string | null;  // URL de la foto de perfil (puede no tener)
  };
}