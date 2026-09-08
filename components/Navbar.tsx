'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Layers, 
  SlidersHorizontal, 
  Sparkles, 
  Wallet, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  LogOut,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { truncateAddress } from '@/lib/format';
import { getStoredJobs, getStoredSession, revokeStoredSession } from '@/lib/storage';
import { revokeAltanaSession } from '@/lib/altana';
import { useWallet } from '@/context/WalletContext';

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, balance, openModal, disconnect, walletType } = useWallet();
  const [jobCount, setJobCount] = useState<number>(0);
  const [showWalletMenu, setShowWalletMenu] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const jobs = getStoredJobs();
    setJobCount(jobs.length);

    const handleStorageChange = () => {
      const updatedJobs = getStoredJobs();
      setJobCount(updatedJobs.length);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickRevoke = async () => {
    setIsRevoking(true);
    try {
      const session = getStoredSession();
      if (session) {
        const res = await revokeAltanaSession(session.sessionKeyId);
        revokeStoredSession(res.txHash);
        setShowWalletMenu(false);
      }
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="grid grid-cols-2 gap-1 p-1">
                <span className="h-2 w-2 rounded-sm bg-slate-950"></span>
                <span className="h-2 w-2 rounded-sm bg-slate-950"></span>
                <span className="h-2 w-2 rounded-sm bg-slate-950"></span>
                <span className="h-2 w-2 rounded-sm bg-amber-200"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  FourCorners
                </span>
                <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-400/20">
                  BNB STUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                The Autonomous Agent Marketplace
              </p>
            </div>
          </Link>

          {/* Primary Nav */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === '/'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Explore Gigs
            </Link>
            <Link
              href="/categories/health-factor"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname.startsWith('/categories')
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Categories
            </Link>
            <Link
              href="/compare"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                pathname === '/compare'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
              <span>Compare</span>
            </Link>
            <Link
              href="/how-it-works"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === '/how-it-works'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Architecture
            </Link>
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Network Badge */}
          <div className="hidden lg:flex items-center space-x-2 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono">BSC Testnet</span>
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
              97
            </span>
          </div>

          {/* My Hires Link */}
          <Link
            href="/my-hires"
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
              pathname === '/my-hires'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4 text-amber-400" />
            <span>My Hires</span>
            {jobCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500/20 text-amber-400 px-1.5 py-0.2 text-[10px] font-bold border border-amber-500/30">
                {jobCount}
              </span>
            )}
          </Link>

          {/* Real Wallet Connect Button / Menu */}
          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-200 hover:border-slate-600 transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                <span className="font-mono text-amber-400 font-bold hidden sm:inline">{balance} tBNB</span>
                <span className="font-mono">{truncateAddress(address)}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">Connected Wallet</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase font-mono">
                      {walletType || 'Web3'}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Address</span>
                      <button
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white flex items-center space-x-1"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs text-white break-all">{address}</p>
                    <div className="text-[11px] text-amber-400 font-mono pt-1">
                      Balance: <span className="font-bold">{balance} tBNB</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <Link
                      href="/my-hires"
                      onClick={() => setShowWalletMenu(false)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <span>Session Telemetry</span>
                      <ShieldCheck className="h-4 w-4 text-amber-400" />
                    </Link>
                    <a
                      href={`https://testnet.bscscan.com/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <span>View on BscScan</span>
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </a>
                    <button
                      onClick={handleQuickRevoke}
                      disabled={isRevoking}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <span>{isRevoking ? 'Revoking...' : 'Revoke Session Key'}</span>
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        disconnect();
                        setShowWalletMenu(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    >
                      <span>Disconnect</span>
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openModal}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
