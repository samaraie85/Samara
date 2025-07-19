import './globals.css';
import { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import { Aclonica } from "next/font/google";
import Footer from './shared_components/Footer';
import { Providers } from './providers';

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

const aclonica = Aclonica({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-aclonica',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Samara',
  description: 'High quality Arabic products with authentic arabic authenticity',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ],
  },
  manifest: '/site.webmanifest',
  applicationName: 'Samara',
  keywords: ['Arabic', 'Authentic', 'Products', 'Fashion', 'Traditional'],
  authors: [{ name: 'Samara' }],
  creator: 'Samara',
  publisher: 'Samara',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${aclonica.variable}`}>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
