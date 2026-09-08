import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getAgentById } from '@/lib/agents';
import HireWizard from '@/components/HireWizard';
import { formatUsd } from '@/lib/format';

export default async function HireAgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const agent = getAgentById(agentId);

  if (!agent) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">Marketplace</Link>
        <span>/</span>
        <Link href={`/agents/${agent.id}`} className="hover:text-white transition-colors">
          {agent.name}
        </Link>
        <span>/</span>
        <span className="text-slate-200">Hire Wizard</span>
      </div>

      {/* Agent Summary Banner */}
      <div className="mx-auto max-w-2xl flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center space-x-3.5">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-800 object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">{agent.name}</h2>
              <span className="rounded bg-amber-400/10 px-2 py-0.2 text-[10px] font-bold text-amber-400 border border-amber-400/20">
                {agent.sellerTier}
              </span>
            </div>
            <p className="text-xs text-slate-400">{agent.shortDescription}</p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-sm font-bold text-white">{agent.minBudget} tBNB</div>
          <div className="text-[11px] text-slate-400">{formatUsd(agent.minBudget)}</div>
        </div>
      </div>

      {/* Hire Wizard Component */}
      <HireWizard agent={agent} />
    </div>
  );
}
