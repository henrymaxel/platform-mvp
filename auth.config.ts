// auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUser } from '@/app/lib/database';

export const authConfig: NextAuthConfig = {
  cookies: {
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      // console.log("HERE JWT");
      if (user?.id) {
        token.id = user.id;
        token.first_name = user.first_name || '';
        token.last_name = user.last_name || '';
        token.username = user.username || `${user.first_name}_${user.last_name}`;
        token.email = user.email || '';
        token.role = user.role || '';
        token.profile_picture_url = user.profile_picture_url || '/fallback_avatar.png';
      }
              // console.log("TOKEN: ", token);
      return token;
    },
    async session({ session, token }) {
      // console.log("HERE SESSIONS");
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
        session.user.role = token.role as string;
        session.user.profile_picture_url = token.profile_picture_url as string;
        // console.log("SESS: ", session);
      return session;
    }
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUser(credentials.email as string);
        
        if (!user) return null;
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          role: user.role,
          profile_picture_url: user.profile_picture_url,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
