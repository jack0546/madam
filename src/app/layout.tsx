
import type {Metadata} from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'Lithos | Geology & Deep Time',
  description: 'Explore the layers of our planet — from ancient seabeds to drifting ash, layered across millions of years beneath us.',
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
      <body className="antialiased selection:bg-[#e8702a]/30 min-h-screen flex flex-col">
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
