import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        profile_picture_url: string;
    }

  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    role: string;
    profile_picture_url: string;
  }
}
