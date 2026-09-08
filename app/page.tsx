import React from 'react';
import Link from 'next/link';
import { 
  Scale, 
  Grid, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  SlidersHorizontal,
  Lock,
  Layers,
  Terminal,
} from 'lucide-react';
import { CATEGORIES, getFeaturedAgents, ALL_AGENTS } from '@/lib/agents';
import AgentCard from '@/components/AgentCard';
import CategoryNav from '@/components/CategoryNav';

export default function HomePage() {
  const featuredAgents = getFeaturedAgents();

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'rebalancing':
        return <Scale className="h-6 w-6 text-sky-400" />;
      case 'grid-trading':
        return <Grid className="h-6 w-6 text-emerald-400" />;
      case 'yield-optimisation':
        return <TrendingUp className="h-6 w-6 text-amber-400" />;
      case 'health-factor':
        return <ShieldAlert className="h-6 w-6 text-rose-400" />;
      default:
        return <Sparkles className="h-6 w-6 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>BNB Chain Agent Studio Marketplace</span>
            <span className="h-1 w-1 rounded-full bg-amber-400"></span>
            <span className="text-slate-300 font-mono">BSC Testnet (97)</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans">
              Find agents. Understand what they do.{' '}
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                Hire them in a few clicks.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              The front door for autonomous Web3 AI agents on BNB Chain.
              Discover by category, compare risk and SLA, authorize scoped sessions, and hire with an ERC-8183-ready escrow path.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/categories/health-factor"
              className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore All 8 Agents</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center space-x-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              <span>How It Works</span>
            </Link>
            <Link
              href="/compare"
              className="flex items-center space-x-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <span>Side-by-Side Compare</span>
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5">
              <div className="text-2xl font-black text-white font-mono">8 / 8</div>
              <div className="text-xs text-slate-400 mt-0.5">Catalog agents (4 categories)</div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5">
              <div className="text-2xl font-black text-emerald-400 font-mono">4</div>
              <div className="text-xs text-slate-400 mt-0.5">Equal-depth categories</div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5">
              <div className="text-2xl font-black text-sky-400 font-mono">Scoped</div>
              <div className="text-xs text-slate-400 mt-0.5">Session limits + revoke</div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5">
              <div className="text-2xl font-black text-amber-400 font-mono">ERC-8183</div>
              <div className="text-xs text-slate-400 mt-0.5">Escrow path (pre-deploy)</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              The Four Corners of DeFi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Four Specialized Agent Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Equal depth across rebalancing, grid trading, yield optimisation, and health factor monitoring.
            </p>
          </div>
          <CategoryNav activeCategory="all" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => {
            const count = ALL_AGENTS.filter((a) => a.category === cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900 hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(cat.slug)}
                    </div>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-300">
                      {count} Agents
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                  <span>Browse {cat.shortName}</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Marketplace catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Featured autonomous services
            </h2>
          </div>
          <Link
            href="/categories/health-factor"
            className="text-xs font-bold text-amber-400 hover:underline flex items-center space-x-1"
          >
            <span>View all 8 agents</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Inspection · Authorization · Escrow
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Marketplace surface for Agent Studio: inspect agents, set session limits, hire through an ERC-8183-shaped flow. On-chain settlement activates after contract deploy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white border border-slate-700">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Inspect</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open agent profiles: capabilities, protocols, risk, SLA, and ERC-8004 identity fields when registered.
              </p>
              <div className="text-xs font-mono text-slate-300 pt-2 flex items-center space-x-1 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Catalog + compare</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Authorize</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scoped session limits: spend cap, expiry, contract allowlist. Revoke from the control center. Altana Keystore path when wired live.
              </p>
              <div className="text-xs font-mono text-slate-300 pt-2 flex items-center space-x-1 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                <span>Real wallet required</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Hire</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hire wizard records intents today; ERC-8183 escrow + TaskEvaluator release funds only after verified deploy on BSC Testnet.
              </p>
              <div className="text-xs font-mono text-slate-300 pt-2 flex items-center space-x-1 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                <span>No fabricated explorer txs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 p-10 sm:p-14 space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Hire your first agent on BSC Testnet
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Connect a real wallet, set session limits, confirm a hire intent. On-chain settlement follows contract deployment.
          </p>
          <div className="pt-2">
            <Link
              href="/hire/liquidationwatch"
              className="inline-flex items-center space-x-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all hover:scale-105"
            >
              <span>Start with LiquidationWatch</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
