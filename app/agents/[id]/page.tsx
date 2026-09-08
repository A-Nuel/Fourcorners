'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Star, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Terminal, 
  Layers, 
  Lock, 
  ExternalLink,
  Code2,
  FileCheck,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import { getAgentById } from '@/lib/agents';
import { formatBnb, formatUsd, truncateAddress, get8004ScanUrl, getBscScanAddressUrl } from '@/lib/format';
import { toggleCompareId, getCompareIds } from '@/lib/storage';

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agent = getAgentById(id);

  if (!agent) {
    notFound();
  }

  // Selected package tab
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const currentPkg = agent.packages[selectedPkgIndex] || agent.packages[0];

  // Parameter Builder State
  const [customParams, setCustomParams] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    agent.inputParameters.forEach((p) => {
      initial[p.name] = p.default;
    });
    return initial;
  });

  const handleParamChange = (name: string, val: any) => {
    setCustomParams((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Bar */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">Marketplace</Link>
        <span>/</span>
        <Link href={`/categories/${agent.category}`} className="hover:text-white capitalize transition-colors">
          {agent.category.replace('-', ' ')}
        </Link>
        <span>/</span>
        <span className="text-slate-200">{agent.name}</span>
      </div>

      {/* Main Gig Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: 2 Cols Wide (GitHub-style inspectable repository) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div className="flex items-start space-x-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-1">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-full w-full rounded-xl object-cover"
                  />
                  <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{agent.name}</h1>
                    <CheckCircle2 className="h-5 w-5 text-sky-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{agent.shortDescription}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs font-bold text-amber-400">
                  {agent.sellerTier}
                </span>
                <div className="flex items-center text-xs text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400 mr-1" />
                  <span className="font-bold text-white text-sm">{agent.rating.toFixed(2)}</span>
                  <span className="text-slate-400 ml-1">({agent.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Verification & Identity Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">ERC-8004 Identity</span>
                <a
                  href={get8004ScanUrl(agent.erc8004Id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline flex items-center space-x-1 truncate"
                >
                  <span className="truncate">{agent.erc8004Id}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Provider Address</span>
                <a
                  href={getBscScanAddressUrl(agent.providerAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>{truncateAddress(agent.providerAddress)}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Risk Level</span>
                <span className={`font-bold ${
                  agent.riskLevel === 'Low' ? 'text-emerald-400' : agent.riskLevel === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {agent.riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Strategy & Mechanism Breakdown */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-amber-400" />
              <span>Strategy Overview & Logic</span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              {agent.longDescription}
            </p>

            {/* Supported Protocols */}
            <div className="pt-2">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-2">
                Supported Protocols & Oracles
              </span>
              <div className="flex flex-wrap gap-2">
                {agent.supportedProtocols.map((protocol, i) => (
                  <span
                    key={i}
                    className="rounded-xl bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    {protocol}
                  </span>
                ))}
              </div>
            </div>

            {/* Capabilities List */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <span className="text-xs uppercase font-semibold text-slate-400 block">
                Autonomous Capabilities
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {agent.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Task Parameter Builder & Interactive Schema */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <SlidersHorizontal className="h-5 w-5 text-sky-400" />
                <span>Task Parameters Schema</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Customizable</span>
            </div>
            <p className="text-xs text-slate-400">
              Configure the execution parameters passed to {agent.name} during hire.
            </p>

            <div className="space-y-4">
              {agent.inputParameters.map((param) => (
                <div key={param.name} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-white font-mono">{param.name}</label>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{param.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{param.description}</p>
                  <input
                    type={param.type === 'number' ? 'number' : 'text'}
                    value={customParams[param.name] ?? ''}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 font-mono text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Explicit Permissions Required Table */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Lock className="h-5 w-5 text-emerald-400" />
                <span>Required Altana Permissions</span>
              </h2>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                Non-Custodial Scoped
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Before {agent.name} executes, you will sign a scoped Altana session. The agent cannot call any function outside this allowlist.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="pb-2">Target Contract</th>
                    <th className="pb-2">Allowed Calls</th>
                    <th className="pb-2 text-right">Spend Cap Hint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {agent.requiredPermissions.targetContracts.map((target, i) => (
                    <tr key={i}>
                      <td className="py-2.5 text-sky-400">{truncateAddress(target, 8, 6)}</td>
                      <td className="py-2.5 text-slate-300">
                        {agent.requiredPermissions.allowedFunctions.join(', ')}
                      </td>
                      <td className="py-2.5 text-right font-bold text-amber-400">
                        {agent.requiredPermissions.spendCeilingHint}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* On-Chain Work Verification Criteria */}
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-8 space-y-3 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileCheck className="h-5 w-5 text-emerald-400" />
              <span>TaskEvaluator Proof of Work Verification</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {agent.evaluatorVerificationCheck}
            </p>
            <div className="text-[11px] text-emerald-400/90 font-mono bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              Escrow funds locked via ERC-8183 will only release to the agent after the TaskEvaluator smart contract on BSC Testnet cryptographically verifies this state change.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 1 Col Wide (Sticky Fiverr-style Gig Package & Hire Card) */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            {/* Package Tabs */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
              {agent.packages.map((pkg, idx) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkgIndex(idx)}
                  className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                    selectedPkgIndex === idx
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pkg.name}
                </button>
              ))}
            </div>

            {/* Price & Turnaround Box */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white font-mono">
                  {currentPkg.priceBnb} tBNB
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {currentPkg.priceUsd}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-1">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Turnaround: {currentPkg.turnaroundTime}</span>
              </div>
            </div>

            {/* Package Deliverables */}
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                What's Included
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentPkg.deliverables.map((deliv, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>ERC-8183 Escrow Protected</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Payment held in smart contract escrow on BSC Testnet. Auto-refunds if proof fails.
              </p>
            </div>

            {/* Hire Action CTA */}
            <Link
              href={`/hire/${agent.id}`}
              className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
            >
              <span>Hire {agent.name}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={() => toggleCompareId(agent.id)}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-950 py-2.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
              <span>Add to Compare Tray</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
