import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gesture Bulb — AI Hand Gesture Controlled Lighting (Next.js)',
  description:
    'Control industrial lighting with real-time hand gesture recognition powered by TensorFlow.js and MediaPipe Hands in Next.js.',
  keywords: [
    'Next.js',
    'TensorFlow.js',
    'MediaPipe',
    'Gesture Recognition',
    'Hand Detection',
    'Interactive Web App',
    'Cyberpunk UI',
  ],
  authors: [{ name: 'Sayan Deb' }],
};

export const viewport: Viewport = {
  themeColor: '#030303',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#030303] text-white selection:bg-amber-400 selection:text-black"
      >
        {children}
      </body>
    </html>
  );
}
