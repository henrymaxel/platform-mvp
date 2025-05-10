//types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    profile_picture_url?: string;
  }

  interface Session {
    user: {
      id: string;
      first_name?: string;
      last_name?: string;
      role?: string;
      profile_picture_url?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    profile_picture_url?: string;
  }
}