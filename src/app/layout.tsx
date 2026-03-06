import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://commute-companion.vercel.app'),
  title: {
    default: 'Commute Companion',
    template: '%s | Commute Companion',
  },
  description: 'AI-powered campus ride sharing & live bus tracking for Knowledge Park, Greater Noida',
  keywords: ['ride sharing', 'campus commute', 'bus tracking', 'greater noida', 'knowledge park', 'carpooling'],
  authors: [{ name: 'Commute Companion Team' }],
  creator: 'Commute Companion',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://commute-companion.vercel.app',
    siteName: 'Commute Companion',
    title: 'Commute Companion - AI-Powered Campus Ride Sharing',
    description: 'Share rides, track buses, earn rewards. The smart way to commute in Greater Noida.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commute Companion',
    description: 'AI-Powered Campus Ride Sharing & Live Bus Tracking',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-body antialiased touch-manipulation" suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
