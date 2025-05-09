import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.email = user.email;
        token.role = user.role;
        token.profile_picture_url = user.profile_picture_url;
      }
      return token;
    },
async session({ session, token }) {
  session.user.id = token.id as string;
  session.user.role = token.role as string;
  session.user.first_name = token.first_name as string;
  session.user.last_name = token.last_name as string;
  session.user.email = token.email as string;
  session.user.profile_picture_url = token.profile_picture_url as string | '/fallback_avatar.png';
  return session;
},

  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;