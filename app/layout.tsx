import type { Metadata } from "next";
import { inter } from '@/app/ui/fonts';
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Company A",
  description: "All-in-One Reading, Writing & Publishing Platform Powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <SessionProvider>
        {children}
        </SessionProvider>

      </body>
    </html>
  );
}
