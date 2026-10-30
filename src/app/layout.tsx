import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/modals/CartDrawer';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { BackToTop } from '@/components/ui/BackToTop';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/constants';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  keywords: [
    'VED-HUB',
    'ved-hub.in',
    'Everyday essentials',
    'Printer Ink',
    'Cartridges',
    'Bracelets',
    'Hand accessories',
    'Shopping India',
  ],
  authors: [{ name: 'VED-HUB Team' }],
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#171717',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-white text-[#171717] antialiased flex flex-col font-sans selection:bg-[#171717] selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <SkipToContent />
                <Header />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <Footer />
                <CartDrawer />
                <BackToTop />
                <CookieConsent />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
