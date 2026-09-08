'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  SlidersHorizontal,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Agent } from '@/lib/types';
import { formatBnb, formatUsd, truncateAddress } from '@/lib/format';
import { getCompareIds, toggleCompareId } from '@/lib/storage';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const ids = getCompareIds();
    setIsCompared(ids.includes(agent.id));

    const handleCompareChanged = (e: any) => {
      const updatedIds = e.detail || [];
      setIsCompared(updatedIds.includes(agent.id));
    };

    window.addEventListener('fourcorners_compare_changed', handleCompareChanged);
    return () => window.removeEventListener('fourcorners_compare_changed', handleCompareChanged);
  }, [agent.id]);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompareId(agent.id);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'rebalancing':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'grid-trading':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'yield-optimisation':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'health-factor':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Top Rated Agent':
        return 'text-amber-300 bg-amber-400/10 border-amber-400/30';
      case 'Level 2 Agent':
        return 'text-sky-300 bg-sky-400/10 border-sky-400/30';
      default:
        return 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30';
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900 hover:shadow-2xl hover:shadow-amber-500/5">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${getCategoryColor(agent.category)} capitalize`}>
          {agent.category.replace('-', ' ')}
        </span>
        <div className="flex items-center space-x-2">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${getTierBadge(agent.sellerTier)}`}>
            {agent.sellerTier}
          </span>
          <button
            onClick={handleToggleCompare}
            title="Add to comparison"
            className={`flex items-center space-x-1 rounded-md px-2 py-0.5 text-[11px] transition-colors border ${
              isCompared
                ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="hidden sm:inline">{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>
        </div>
      </div>

      {/* Agent Identity & Avatar */}
      <Link href={`/agents/${agent.id}`} className="flex items-start space-x-3.5 mb-3 group-hover:opacity-95">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-0.5">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="h-full w-full rounded-lg object-cover"
          />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate">
              {agent.name}
            </h3>
            <CheckCircle className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
              <span className="font-semibold text-white">{agent.rating.toFixed(2)}</span>
              <span className="text-slate-400 ml-1">({agent.reviewsCount})</span>
            </div>
            <span>•</span>
            <span className="text-[11px] font-mono text-slate-400">
              {truncateAddress(agent.providerAddress)}
            </span>
          </div>
        </div>
      </Link>

      {/* Description / Value Proposition */}
      <Link href={`/agents/${agent.id}`} className="flex-1">
        <p className="text-xs leading-relaxed text-slate-300 line-clamp-2 mb-3">
          {agent.shortDescription}
        </p>

        {/* Capability Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.capabilities.slice(0, 3).map((cap, i) => (
            <span
              key={i}
              className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60"
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="rounded bg-slate-800/50 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-800">
              +{agent.capabilities.length - 3} more
            </span>
          )}
        </div>
      </Link>

      {/* Performance Signal / Protocol Badge */}
      {agent.metrics.performanceSignal && (
        <div className="mb-3.5 flex items-center justify-between rounded-lg bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 text-xs">
          <span className="text-[11px] text-slate-400 flex items-center">
            <Zap className="h-3 w-3 text-amber-400 mr-1" />
            Verified Signal
          </span>
          <span className="text-xs font-semibold text-emerald-400 font-mono">
            {agent.metrics.performanceSignal}
          </span>
        </div>
      )}

      {/* Bottom Hiring Footer */}
      <div className="mt-auto border-t border-slate-800/80 pt-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center text-[10px] text-slate-400">
            <Clock className="h-3 w-3 mr-1 text-slate-400" />
            <span>{agent.deliveryTime}</span>
          </div>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {agent.hirePriceHint.split('/')[0]}
            <span className="text-[11px] font-normal text-slate-400 ml-1">
              ({formatUsd(agent.minBudget)})
            </span>
          </div>
        </div>

        <Link
          href={`/hire/${agent.id}`}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
        >
          <span>Hire</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
