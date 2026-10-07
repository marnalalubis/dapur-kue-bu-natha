import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import MobileBottomNav from '@/components/MobileBottomNav';


export const metadata: Metadata = {
  title: 'Dapur Kue Bu Natha — Pesan Kue Kering Homemade Premium',
  description:
    'Pemesanan aneka kue kering klasik dan modern khas Lebaran (Nastar Wisman, Kastengel Keju Edam, Putri Salju Mede, Sagu Keju). Fresh from the oven langsung ke rumah Anda.',
  keywords: [
    'Kue Kering',
    'Nastar Wisman',
    'Kastengel Keju',
    'Putri Salju',
    'Sagu Keju',
    'Kue Lebaran',
    'Dapur Kue Bu Natha',
    'Kue Homemade',
  ],
  authors: [{ name: 'Dapur Kue Bu Natha' }],
  openGraph: {
    title: 'Dapur Kue Bu Natha — Pesan Kue Kering Homemade Premium',
    description:
      'Pesan aneka kue kering klasik & modern dengan butter pilihan. Fresh from the oven tanpa ribet via WhatsApp.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Dapur Kue Bu Natha',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dapur Kue Bu Natha — Pesan Kue Kering Homemade Premium',
    description: 'Pesan kue kering homemade fresh from the oven langsung ke rumah.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#fffdfa] text-stone-800 selection:bg-amber-100 selection:text-amber-900">
        <CartProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
