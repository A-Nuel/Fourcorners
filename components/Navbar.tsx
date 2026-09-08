'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Wallet,
  ExternalLink,
  ChevronDown,
  LogOut,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { truncateAddress } from '@/lib/format';
import {
  getStoredJobs,
  getStoredSession,
  revokeStoredSession,
  clearSession,
} from '@/lib/storage';
import { revokeAltanaSession } from '@/lib/altana';
import {
  connectWallet,
  getConnectedAccount,
  WalletError,
} from '@/lib/walletConnect';

export default function Navbar() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [jobCount, setJobCount] = useState<number>(0);
  const [showWalletMenu, setShowWalletMenu] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshCounts = () => {
    setJobCount(getStoredJobs().length);
  };

  useEffect(() => {
    getConnectedAccount().then((addr) => {
      if (addr) setWalletAddress(addr);
    });
    refreshCounts();

    const onChange = () => refreshCounts();
    window.addEventListener('fourcorners_jobs_changed', onChange);
    window.addEventListener('fourcorners_session_changed', onChange);
    window.addEventListener('storage', onChange);

    const eth = (window as any).ethereum;
    const onAccounts = (accounts: string[]) => {
      setWalletAddress(accounts?.[0] || '');
      if (!accounts?.[0]) clearSession();
    };
    eth?.on?.('accountsChanged', onAccounts);

    return () => {
      window.removeEventListener('fourcorners_jobs_changed', onChange);
      window.removeEventListener('fourcorners_session_changed', onChange);
      window.removeEventListener('storage', onChange);
      eth?.removeListener?.('accountsChanged', onAccounts);
    };
  }, []);

  const handleConnect = async () => {
    setConnectError('');
    setIsConnecting(true);
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
    } catch (e: any) {
      const msg =
        e instanceof WalletError
          ? e.message
          : e?.message || 'Wallet connection failed';
      setConnectError(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    clearSession();
    setShowWalletMenu(false);
  };

  const handleQuickRevoke = async () => {
    setIsRevoking(true);
    try {
      const session = getStoredSession();
      if (session?.sessionKeyId) {
        const result = await revokeAltanaSession(session.sessionKeyId);
        revokeStoredSession(result.txHash || undefined);
      } else {
        clearSession();
      }
    } catch (e) {
      console.error(e);
      clearSession();
    } finally {
      setIsRevoking(false);
      setShowWalletMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080c14]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === '/compare'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Compare
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

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">BSC Testnet</span>
            <span className="font-mono text-slate-500">97</span>
          </div>

          <Link
            href="/my-hires"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">My Hires</span>
            {jobCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
                {jobCount}
              </span>
            )}
          </Link>

          {walletAddress ? (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu((v) => !v)}
                className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:border-amber-500/40 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono">{truncateAddress(walletAddress)}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-xl z-50">
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
                      <span>{isRevoking ? 'Revoking...' : 'Revoke Session'}</span>
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
            <div className="flex flex-col items-end">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95 disabled:opacity-60"
              >
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? 'Connecting…' : 'Connect Wallet'}</span>
              </button>
              {connectError && (
                <p className="mt-1 max-w-[14rem] text-right text-[10px] text-rose-400">
                  {connectError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
