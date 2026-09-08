'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, Grid, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/lib/agents';
import { Category } from '@/lib/types';

interface CategoryNavProps {
  activeCategory?: Category | 'all';
}

export default function CategoryNav({ activeCategory = 'all' }: CategoryNavProps) {
  const getIcon = (slug: Category) => {
    switch (slug) {
      case 'rebalancing':
        return <Scale className="h-4 w-4" />;
      case 'grid-trading':
        return <Grid className="h-4 w-4" />;
      case 'yield-optimisation':
        return <TrendingUp className="h-4 w-4" />;
      case 'health-factor':
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center space-x-2 min-w-max p-1 bg-slate-900/60 rounded-2xl border border-slate-800">
        <Link
          href="/"
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>All Categories (8)</span>
        </Link>

        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span style={{ color: cat.accentColor }}>{getIcon(cat.slug)}</span>
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
