

import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400", // Regular weight
  style: "normal",
  variable: "--font-instrument-serif",
});


export const metadata: Metadata = {
  title: 'Premium Burger & Cafe',
  description: 'Professional Dashboard for Category and Product Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
       <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
       <body className="font-sans antialiased">
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}