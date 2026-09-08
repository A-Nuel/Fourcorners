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
  RotateCcw
} from 'lucide-react';
import { truncateAddress } from '@/lib/format';
import { getStoredJobs, getStoredSession, revokeStoredSession } from '@/lib/storage';
import { revokeAltanaSession } from '@/lib/altana';

export default function Navbar() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isAltanaConnected, setIsAltanaConnected] = useState<boolean>(false);
  const [jobCount, setJobCount] = useState<number>(0);
  const [showWalletMenu, setShowWalletMenu] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  useEffect(() => {
    // Initial read
    const session = getStoredSession();
    if (session && session.status === 'active') {
      setWalletAddress(session.ownerAddress);
      setIsAltanaConnected(true);
    } else if (typeof window !== 'undefined' && (window as any).ethereum?.selectedAddress) {
      setWalletAddress((window as any).ethereum.selectedAddress);
    }

    const jobs = getStoredJobs();
    setJobCount(jobs.length);

    const handleStorageChange = () => {
      const updatedJobs = getStoredJobs();
      setJobCount(updatedJobs.length);
      const s = getStoredSession();
      if (s && s.status === 'active') {
        setWalletAddress(s.ownerAddress);
        setIsAltanaConnected(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
          return;
        }
      } catch (e) {
        console.warn('Injected wallet request rejected, using Altana session demo wallet', e);
      }
    }
    // Default demonstration agentic wallet on BSC Testnet
    const demoWallet = '0x32759604104c810E3B68565b939E8b64e0303E8A';
    setWalletAddress(demoWallet);
    setIsAltanaConnected(true);
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setIsAltanaConnected(false);
    setShowWalletMenu(false);
  };

  const handleQuickRevoke = async () => {
    setIsRevoking(true);
    try {
      const session = getStoredSession();
      if (session) {
        const res = await revokeAltanaSession(session.sessionKeyId);
        revokeStoredSession(res.txHash);
        setIsAltanaConnected(false);
        setShowWalletMenu(false);
      }
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
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

          {/* Wallet Connect Button / Menu */}
          {walletAddress ? (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-200 hover:border-slate-600 transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                <span className="font-mono">{truncateAddress(walletAddress)}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-lg z-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-xs text-slate-400">Connected Account</span>
                    <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                      Altana Session
                    </span>
                  </div>
                  <p className="font-mono text-xs text-white break-all mb-3">
                    {walletAddress}
                  </p>

                  <div className="space-y-1">
                    <Link
                      href="/my-hires"
                      onClick={() => setShowWalletMenu(false)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <span>Session Telemetry</span>
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    </Link>
                    <a
                      href={`https://testnet.bscscan.com/address/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <span>View on BscScan</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>
                    <button
                      onClick={handleQuickRevoke}
                      disabled={isRevoking}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <span>{isRevoking ? 'Revoking...' : 'Revoke Session Key'}</span>
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    >
                      <span>Disconnect</span>
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
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
