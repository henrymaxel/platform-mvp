import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { AuthUser } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const sql = postgres(process.env.POSTGRES_URL!, { ssl: false });

async function getUser(email: string): Promise<AuthUser | undefined> {
    try {

        const user = await sql<AuthUser[]>`SELECT * FROM users WHERE email=${email}`;
        return user[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error; 
    }
}

 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            console.log('Login attempt for:', email);

            const user = await getUser(email);
            console.log('User from DB:', user);

            if (!user) return null;
            
            const passwordsMatch = await bcrypt.compare(password, user.password);
            console.log("Password match: ", passwordsMatch);

            if (passwordsMatch) {

              const authUser: AuthUser = {
                id: user.id,
                first_name: `${user.first_name}`,
                last_name: `${user.last_name}`,
                email: user.email,
                password: user.password,
                role: user.role,
                profile_picture_url: user.profile_picture_url,
              };

              return authUser;
            }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});