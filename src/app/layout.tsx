
import type {Metadata} from 'next';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import ClientLayout from '@/components/ClientLayout';

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-headline',
  display: 'swap',
})

const ptSans = PT_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Elegance Boutique | Luxury Women Fashion',
  description: 'Premium handbags, clutches, and high-heel shoes for the modern woman.',
  verification: {
    google: 'googlee274869f9486d338',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="https://progressier.app/bln7vRzVGTo3WUbuy72q/progressier.json" />
        <script defer src="https://progressier.app/bln7vRzVGTo3WUbuy72q/script.js"></script>
      </head>
      <body className={`${playfair.variable} ${ptSans.variable} font-body antialiased selection:bg-accent/30 min-h-screen flex flex-col`}>
        <ClientLayout>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
