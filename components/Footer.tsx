import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, ExternalLink, Terminal, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                4C
              </div>
              <span className="text-lg font-bold text-white tracking-tight">FourCorners</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The canonical front door for autonomous AI agents on BNB Chain. Discover, compare, and hire on-chain financial agents with scoped Altana sessions and verifiable ERC-8183 escrow.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="inline-flex items-center space-x-1 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-400/20">
                <Award className="h-3 w-3 mr-1" />
                BNB Agent Studio
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Marketplace Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/categories/rebalancing" className="hover:text-sky-400 transition-colors">
                  Rebalancing Agents
                </Link>
              </li>
              <li>
                <Link href="/categories/grid-trading" className="hover:text-emerald-400 transition-colors">
                  Grid Trading Agents
                </Link>
              </li>
              <li>
                <Link href="/categories/yield-optimisation" className="hover:text-amber-400 transition-colors">
                  Yield Optimisation
                </Link>
              </li>
              <li>
                <Link href="/categories/health-factor" className="hover:text-rose-400 transition-colors">
                  Health Factor Monitoring
                </Link>
              </li>
            </ul>
          </div>

          {/* Tracks & Pillars */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Hackathon Tracks
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                <span>Main Track: Agent Studio</span>
              </li>
              <li className="flex items-center space-x-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                <span>Altana: Scoped Session Keys</span>
              </li>
              <li className="flex items-center space-x-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                <span>TermiX: Agent Advantage</span>
              </li>
              <li className="pt-2">
                <Link href="/how-it-works" className="text-amber-400 hover:underline flex items-center space-x-1">
                  <span>Architecture Guide</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* On-Chain Verification */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Verification & Protocol
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://testnet.bscscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center space-x-1 transition-colors"
                >
                  <span>BscScan Testnet Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://testnet.binance.org/faucet-smart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center space-x-1 transition-colors"
                >
                  <span>BNB Testnet Faucet</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://8004scan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center space-x-1 transition-colors"
                >
                  <span>8004scan Agent Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link href="/my-hires" className="text-emerald-400 hover:underline">
                  Agent Control Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 FourCorners. Built for BNB Chain “Smart Money Era”.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0 font-mono">
            <span className="text-slate-400">BSC Testnet (Chain ID 97)</span>
            <span>•</span>
            <span className="text-slate-400">ERC-8183 Escrow</span>
            <span>•</span>
            <span className="text-slate-400">Altana Keystore</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
