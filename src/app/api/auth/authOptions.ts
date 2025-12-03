// src/app/api/auth/authOptions.ts
import { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connect } from '@/app/libs/mongodb';
import UserModel from '@/app/models/user';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';

interface ExtendedJWT extends JWT {
  user?: {
    id: string;
    email: string;
    name: string;
    profilePicture?: string | null;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password', placeholder: '*******' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor proporciona un email y contraseña válidos');
        }

        await connect();
        const user = await UserModel.findOne({ email: credentials.email })
          .select('+password +failedLoginAttempts +isLocked');

        if (!user) throw new Error('Email o contraseña inválidos');
        if (user.isLocked) throw new Error('Tu cuenta está bloqueada');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          if (user.failedLoginAttempts >= 3) user.isLocked = true;
          await user.save();
          throw new Error('Email o contraseña inválidos');
        }

        user.failedLoginAttempts = 0;
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullname,
          profilePicture: user.profilePicture,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: ExtendedJWT; user?: any }) {
      if (user) token.user = user;
      return token;
    },

    async session({ session, token }: { session: Session; token: ExtendedJWT }) {
      if (token.user) {
        await connect();
        const freshUser = await UserModel.findById(token.user.id).select('fullname email profilePicture');
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

    async redirect({ url, baseUrl }) {
      return `${baseUrl}/welcome`;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
