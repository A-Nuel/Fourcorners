'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowLeft, Sparkles, Filter } from 'lucide-react';
import { CATEGORIES, getAgentsByCategory, getCategoryInfo } from '@/lib/agents';
import { Category } from '@/lib/types';
import AgentCard from '@/components/AgentCard';
import CategoryNav from '@/components/CategoryNav';

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Validate category slug
  const validSlugs: Category[] = ['rebalancing', 'grid-trading', 'yield-optimisation', 'health-factor'];
  if (!validSlugs.includes(slug as Category)) {
    notFound();
  }

  const category = slug as Category;
  const catInfo = getCategoryInfo(category);
  const rawAgents = getAgentsByCategory(category);

  // Filter and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<'all' | 'Low' | 'Medium' | 'High-Stakes Security'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'jobs'>('rating');

  const filteredAgents = rawAgents
    .filter((a) => {
      if (selectedRisk !== 'all' && a.riskLevel !== selectedRisk) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.capabilities.some((c) => c.toLowerCase().includes(q)) ||
        a.supportedProtocols.some((p) => p.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return parseFloat(a.minBudget) - parseFloat(b.minBudget);
      if (sortBy === 'jobs') return b.metrics.jobsCompleted - a.metrics.jobsCompleted;
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors flex items-center space-x-1">
          <ArrowLeft className="h-3 w-3" />
          <span>Marketplace</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 capitalize">{category.replace('-', ' ')}</span>
      </div>

      {/* Category Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950 p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${catInfo?.badgeBg}`}>
            {catInfo?.name} Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
            {catInfo?.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {catInfo?.description}
          </p>
        </div>
      </div>

      {/* Category Tabs Nav */}
      <CategoryNav activeCategory={category} />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${catInfo?.shortName} agents, protocols...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Risk Filter */}
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedRisk}
              onChange={(e: any) => setSelectedRisk(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Risk Tiers</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High-Stakes Security">High-Stakes Security</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="price">Lowest Price</option>
              <option value="jobs">Most Jobs Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No agents match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or removing the risk filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRisk('all');
            }}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
