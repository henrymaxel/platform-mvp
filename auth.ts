//auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { sql } from '@/app/lib/database';
import bcrypt from 'bcryptjs';
import type { User } from '@/app/lib/definitions';

async function getUser(email: string): Promise<User | null> {
  try {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user || null;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUser(credentials.email as string);

        if (!user || !user.password) {
          console.log('Invalid credentials.');
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            profile_picture_url: user.profile_picture_url,
          };
        }

        console.log('Invalid credentials.');
        return null;
      },
    }),
  ],
});