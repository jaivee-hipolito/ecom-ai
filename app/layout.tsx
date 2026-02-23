import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import SessionProvider from '@/components/providers/SessionProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CartAnimationProvider } from '@/contexts/CartAnimationContext';
import SessionSecurity from '@/components/security/SessionSecurity';
import BrowserCloseDetector from '@/components/security/BrowserCloseDetector';
import MaintenanceGuard from '@/components/MaintenanceGuard';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Teezee - E-Commerce Platform',
  description: 'Shop the latest products with ease',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full overflow-x-hidden" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <BrowserCloseDetector />
            </Suspense>
            <SessionSecurity />
            <MaintenanceGuard />
            <AnnouncementBanner />
            <CartProvider>
              <WishlistProvider>
                <CartAnimationProvider>{children}</CartAnimationProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
