'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowRight, ExternalLink, Wallet, CheckCircle2, QrCode, Smartphone } from 'lucide-react';
import { useWallet, WalletType, DiscoveredWallet } from '@/context/WalletContext';

interface StandardWallet {
  id: WalletType;
  name: string;
  description: string;
  badge?: string;
  badgeBg?: string;
  iconBg: string;
  iconText: string;
  detectKey: string;
}

const STANDARD_WALLETS: StandardWallet[] = [
  {
    id: 'binance',
    name: 'Binance Web3 Wallet',
    description: 'Official self-custody wallet for BNB Chain ecosystem',
    badge: 'BNB Native',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    iconText: '🟡',
    detectKey: 'isBinance',
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect using MetaMask browser extension or mobile',
    badge: 'Popular',
    badgeBg: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    iconBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    iconText: '🦊',
    detectKey: 'isMetaMask',
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    description: 'DeFi-first browser extension with built-in transaction simulator',
    iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    iconText: '🐰',
    detectKey: 'isRabby',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Self-custody EVM wallet extension',
    iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    iconText: '⚡',
    detectKey: 'isCoinbaseWallet',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Multi-chain mobile & browser extension wallet',
    iconBg: 'bg-blue-600/20 text-blue-300 border border-blue-600/30',
    iconText: '🛡️',
    detectKey: 'isTrust',
  },
  {
    id: 'altana',
    name: 'Altana Agentic Session',
    description: 'Scoped ephemeral session key registered in BSC Keystore',
    badge: 'Session Key',
    badgeBg: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    iconText: '🔑',
    detectKey: 'altana',
  },
];

export default function WalletModal() {
  const { isModalOpen, closeModal, connect, connectProvider, isConnecting, error, discoveredWallets } = useWallet();
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const eth = (window as any).ethereum;
    const binance = (window as any).BinanceChain;
    const rabby = (window as any).rabby;
    const trust = (window as any).trustwallet;
    const coinbase = (window as any).coinbaseWalletExtension;

    const map: Record<string, boolean> = {
      binance: !!(binance || eth?.isBinance),
      metamask: !!(eth?.isMetaMask && !eth?.isRabby),
      rabby: !!(rabby || eth?.isRabby),
      coinbase: !!(coinbase || eth?.isCoinbaseWallet),
      trust: !!(trust || eth?.isTrust),
      altana: true,
    };
    setInstalledMap(map);
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connect a Web3 Wallet</h3>
              <p className="text-xs text-slate-400">BNB Smart Chain Testnet (Chain ID 97)</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex items-start space-x-2.5 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Discovered Wallets via EIP-6963 */}
        {discoveredWallets.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-1">
              Detected Installed Wallets
            </div>
            <div className="space-y-2">
              {discoveredWallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => connectProvider(w.provider, w.name)}
                  disabled={isConnecting}
                  className="w-full group flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-left transition-all duration-200 hover:border-emerald-500/60 hover:bg-emerald-900/30 disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <img src={w.icon} alt={w.name} className="h-8 w-8 rounded-xl object-contain" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300">
                          {w.name}
                        </span>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-400">
                          INSTALLED
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Ready to connect via EIP-6963</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Standard Wallets List */}
        <div className="space-y-1.5">
          {discoveredWallets.length > 0 && (
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-1 pt-1">
              All Supported Providers
            </div>
          )}
          <div className="space-y-2">
            {STANDARD_WALLETS.map((wallet) => {
              const isDetected = installedMap[wallet.id];
              return (
                <button
                  key={wallet.id}
                  onClick={() => connect(wallet.id)}
                  disabled={isConnecting}
                  className="w-full group flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3 text-left transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/60 disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${wallet.iconBg}`}>
                      {wallet.iconText}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          {wallet.name}
                        </span>
                        {wallet.badge && (
                          <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${wallet.badgeBg}`}>
                            {wallet.badge}
                          </span>
                        )}
                        {isDetected && wallet.id !== 'altana' && (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{wallet.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono">BSC Testnet (Chain ID 97)</span>
          </div>
          <a
            href="https://testnet.binance.org/faucet-smart"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline flex items-center space-x-1"
          >
            <span>Get Free tBNB</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
