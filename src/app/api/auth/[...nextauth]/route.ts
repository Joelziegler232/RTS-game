import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { connect } from '@/app/libs/mongodb';
import UserModel from '@/app/models/user';
import bcrypt from 'bcryptjs';

// Exportamos authOptions para poder usarlo en middleware o pruebas
export { authOptions };

// Extensión del token JWT para incluir datos del usuario logueado
interface ExtendedJWT extends JWT {
  user?: {
    id: string;
    email: string;
    name: string;
    profilePicture?: string | null;
  };
}

// Configuración completa de NextAuth
const authOptions: NextAuthOptions = {
  // Proveedores de autenticación (solo email + contraseña)
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password', placeholder: '*******' },
      },

      // Función que valida el login
      async authorize(credentials) {
        // Validar que vengan email y contraseña
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor proporciona un email y contraseña válidos');
        }

        // Conectar a la base de datos
        await connect();

        // Buscar usuario por email (incluye campos protegidos como password)
        const user = await UserModel.findOne({ email: credentials.email })
          .select('+password +failedLoginAttempts +isLocked');

        // Si no existe el usuario
        if (!user) {
          throw new Error('Email o contraseña inválidos');
        }

        // Si la cuenta está bloqueada por muchos intentos fallidos
        if (user.isLocked) {
          throw new Error('Tu cuenta está bloqueada. Revisa tu correo para desbloquearla.');
        }

        // Verificar si la contraseña es correcta
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          // Aumentar contador de intentos fallidos
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

          // Bloquear cuenta después de 3 intentos
          if (user.failedLoginAttempts >= 3) {
            user.isLocked = true;
          }

          await user.save();
          throw new Error('Email o contraseña inválidos');
        }

        // Login exitoso: reiniciar intentos fallidos
        user.failedLoginAttempts = 0;
        await user.save();

        // Devolver datos del usuario (se guardan en el token)
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullname,
          profilePicture: user.profilePicture,
        };
      },
    }),
  ],

  // Callbacks para personalizar el flujo
  callbacks: {
    // Guardar datos del usuario en el token JWT
    async jwt({ token, user }: { token: ExtendedJWT; user?: any }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
        };
      }
      return token;
    },

    // Actualizar la sesión con datos frescos del usuario
    async session({ session, token }: { session: Session; token: ExtendedJWT }) {
      if (token.user) {
        await connect();
        const freshUser = await UserModel.findById(token.user.id)
          .select('fullname email profilePicture');

        if (freshUser) {
          session.user = {
            id: token.user.id,
            email: freshUser.email,
            name: freshUser.fullname,
            profilePicture: freshUser.profilePicture,
          };
        }
      }
      return session;
    },

    // Redirigir siempre a /welcome después de hacer login
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/welcome`;
    },
  },

  // Páginas personalizadas
  pages: {
    signIn: '/login', // Usa nuestra página de login personalizada
  },

  // Clave secreta para firmar los tokens (obligatoria)
  secret: process.env.NEXTAUTH_SECRET,
};

// Handler principal para las rutas API de NextAuth (GET y POST)
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };