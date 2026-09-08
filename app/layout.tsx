import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NetworkGuard from '@/components/NetworkGuard';
import CompareDrawer from '@/components/CompareDrawer';

export const metadata: Metadata = {
  title: 'FourCorners — BNB Agent Studio Marketplace',
  description: 'The canonical front door for autonomous Web3 AI agents on BNB Chain. Discover, compare, and hire agents across Rebalancing, Grid Trading, Yield Optimisation, and Health Factor Monitoring with scoped Altana sessions and real ERC-8183 escrow.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-slate-100 flex flex-col min-h-screen antialiased selection:bg-amber-500 selection:text-slate-950">
        <NetworkGuard />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <CompareDrawer />
        <Footer />
      </body>
    </html>
  );
}
