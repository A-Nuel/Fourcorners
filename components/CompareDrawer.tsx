'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import { getCompareIds, clearCompareIds, toggleCompareId } from '@/lib/storage';
import { getAgentById } from '@/lib/agents';

export default function CompareDrawer() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    setCompareIds(getCompareIds());

    const handleCompareChanged = (e: any) => {
      setCompareIds(e.detail || []);
    };

    window.addEventListener('fourcorners_compare_changed', handleCompareChanged);
    return () => window.removeEventListener('fourcorners_compare_changed', handleCompareChanged);
  }, []);

  if (compareIds.length === 0) return null;

  const agents = compareIds.map((id) => getAgentById(id)).filter(Boolean);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between rounded-2xl border border-sky-500/40 bg-slate-900/95 p-3.5 shadow-2xl shadow-sky-500/10 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2 overflow-hidden">
            {agents.map((agent) => (
              <div
                key={agent!.id}
                className="relative inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 overflow-hidden bg-slate-800"
              >
                <img
                  src={agent!.avatar}
                  alt={agent!.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              {agents.length} agent{agents.length > 1 ? 's' : ''} selected
            </p>
            <p className="text-[10px] text-slate-400">Compare specs & SLAs side-by-side</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => clearCompareIds()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-xs"
            title="Clear all"
          >
            <X className="h-4 w-4" />
          </button>
          <Link
            href="/compare"
            className="flex items-center space-x-1.5 rounded-xl bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 hover:bg-sky-400 transition-all"
          >
            <span>Compare</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
