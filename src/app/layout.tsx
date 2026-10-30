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
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { BackToTop } from '@/components/ui/BackToTop';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { FloatingContact } from '@/components/ui/FloatingContact';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Brother Store | Printer Ink & Supplies',
  description:
    'Discover genuine Brother printer ink bottles, cartridges, handcrafted bracelets, and accessories at Brother Store.',
  keywords: [
    'Brother Store',
    'Printer Ink',
    'Supplies',
    'Brother ink bottles',
    'BT5000C',
    'BT5000M',
    'BT5000Y',
    'BTD60BK',
    'bracelets',
    'hand accessories',
  ],
  authors: [{ name: 'Brother Store Team' }],
  openGraph: {
    title: 'Brother Store | Printer Ink & Supplies',
    description: 'Discover genuine Brother printer ink bottles, cartridges, and supplies at Brother Store.',
    siteName: 'Brother Store',
    locale: 'en_IN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <SkipToContent />
              <ScrollProgress />
              <Header />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
              <CartDrawer />
              <FloatingContact />
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
