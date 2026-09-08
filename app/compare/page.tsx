'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  SlidersHorizontal, 
  CheckCircle2, 
  Star, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  X,
  Plus
} from 'lucide-react';
import { ALL_AGENTS, getAgentById } from '@/lib/agents';
import { Agent } from '@/lib/types';
import { formatBnb, formatUsd, truncateAddress } from '@/lib/format';
import { getCompareIds, clearCompareIds, toggleCompareId } from '@/lib/storage';

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['rangeguard', 'liquidationwatch']);

  useEffect(() => {
    const ids = getCompareIds();
    if (ids.length >= 2) {
      setSelectedIds(ids.slice(0, 3));
    }
  }, []);

  const agents = selectedIds
    .map((id) => getAgentById(id))
    .filter(Boolean) as Agent[];

  const handleSelectAgent = (slotIndex: number, newId: string) => {
    const updated = [...selectedIds];
    updated[slotIndex] = newId;
    setSelectedIds(updated);
  };

  const handleRemoveAgent = (id: string) => {
    if (selectedIds.length <= 2) return;
    const updated = selectedIds.filter((item) => item !== id);
    setSelectedIds(updated);
  };

  const handleAddSlot = () => {
    if (selectedIds.length >= 3) return;
    const unused = ALL_AGENTS.find((a) => !selectedIds.includes(a.id));
    if (unused) {
      setSelectedIds([...selectedIds, unused.id]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Side-by-Side Evaluator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Compare AI Agents</h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect capabilities, SLAs, pricing, risk profiles, and required permissions side-by-side.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedIds.length < 3 && (
            <button
              onClick={handleAddSlot}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4 text-sky-400" />
              <span>Add 3rd Agent</span>
            </button>
          )}
          <button
            onClick={() => {
              clearCompareIds();
              setSelectedIds(['rangeguard', 'liquidationwatch']);
            }}
            className="rounded-xl border border-slate-800 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-900"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-md">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="p-5 text-slate-400 font-semibold w-1/4">Agent Metric</th>
              {agents.map((agent, index) => (
                <th key={agent.id} className="p-5 font-semibold text-white">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <select
                        value={agent.id}
                        onChange={(e) => handleSelectAgent(index, e.target.value)}
                        className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-white font-bold focus:outline-none"
                      >
                        {ALL_AGENTS.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.category})
                          </option>
                        ))}
                      </select>
                      {agents.length > 2 && (
                        <button
                          onClick={() => handleRemoveAgent(agent.id)}
                          className="text-slate-500 hover:text-rose-400"
                          title="Remove column"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-800 object-cover"
                      />
                      <div>
                        <div className="text-base font-extrabold text-white">{agent.name}</div>
                        <div className="flex items-center text-amber-400 text-[11px]">
                          <Star className="h-3 w-3 fill-amber-400 mr-1" />
                          <span>{agent.rating.toFixed(2)}</span>
                          <span className="text-slate-400 ml-1">({agent.reviewsCount})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {/* Category */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">Category</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5 text-slate-200 capitalize font-medium">
                  {agent.category.replace('-', ' ')}
                </td>
              ))}
            </tr>

            {/* Seller Tier */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">Seller Tier</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5">
                  <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-300 font-semibold">
                    {agent.sellerTier}
                  </span>
                </td>
              ))}
            </tr>

            {/* Pricing & Min Budget */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">Hire Price / Budget</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5 font-mono">
                  <div className="text-sm font-bold text-white">{agent.hirePriceHint}</div>
                  <div className="text-slate-500 text-[11px]">({formatUsd(agent.minBudget)})</div>
                </td>
              ))}
            </tr>

            {/* SLA / Turnaround Time */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">Turnaround SLA</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5">
                  <span className="flex items-center space-x-1.5 text-slate-200 font-medium">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>{agent.deliveryTime}</span>
                  </span>
                </td>
              ))}
            </tr>

            {/* Risk Level */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">Risk Classification</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5">
                  <span className={`font-bold ${
                    agent.riskLevel === 'Low'
                      ? 'text-emerald-400'
                      : agent.riskLevel === 'Medium'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {agent.riskLevel}
                  </span>
                </td>
              ))}
            </tr>

            {/* Supported Protocols */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">Protocols & Oracles</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {agent.supportedProtocols.map((p, i) => (
                      <span
                        key={i}
                        className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Core Capabilities */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">Capabilities</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5">
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {agent.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Altana Spend Ceiling Hint */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">Required Altana Spend Cap</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5 font-mono text-sky-400 font-bold">
                  {agent.requiredPermissions.spendCeilingHint}
                </td>
              ))}
            </tr>

            {/* Evaluator Verification Proof */}
            <tr>
              <td className="p-5 text-slate-400 font-semibold">TaskEvaluator Verification</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5 text-slate-300 leading-relaxed text-[11px]">
                  {agent.evaluatorVerificationCheck}
                </td>
              ))}
            </tr>

            {/* Hire Action Row */}
            <tr className="bg-slate-950/80">
              <td className="p-5 text-slate-400 font-semibold">Action</td>
              {agents.map((agent) => (
                <td key={agent.id} className="p-5">
                  <Link
                    href={`/hire/${agent.id}`}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500 transition-all"
                  >
                    <span>Hire {agent.name}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
