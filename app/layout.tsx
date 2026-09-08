import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NetworkGuard from '@/components/NetworkGuard';
import CompareDrawer from '@/components/CompareDrawer';
import WalletModal from '@/components/WalletModal';
import { WalletProvider } from '@/context/WalletContext';

export const metadata: Metadata = {
  title: 'FourCorners — Autonomous Agent Marketplace for BNB Smart Chain',
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
        <WalletProvider>
          <NetworkGuard />
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <CompareDrawer />
          <Footer />
          <WalletModal />
        </WalletProvider>
      </body>
    </html>
  );
}
