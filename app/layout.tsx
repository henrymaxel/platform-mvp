import type { Metadata } from "next";
import { inter } from '@/app/ui/fonts';
import "./globals.css";
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "The Boring Platform",
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
        className={`${inter.className} antialiased h-screen overflow-hidden m-0 p-0`}
      >
        <Providers>
          {children}
        </Providers>

      </body>
    </html>
  );
}
