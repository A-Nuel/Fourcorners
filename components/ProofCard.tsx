'use client';

import React from 'react';
import { ShieldCheck, ExternalLink, CheckCircle2, ArrowRight, Hash, Database } from 'lucide-react';
import { VerificationProof } from '@/lib/types';
import { truncateAddress, getBscScanTxUrl, getBscScanAddressUrl } from '@/lib/format';

interface ProofCardProps {
  proof: VerificationProof;
  jobId: string;
}

export default function ProofCard({ proof, jobId }: ProofCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>TaskEvaluator Proof of Work</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300">
                VERIFIED ON-CHAIN
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Evaluated: {new Date(proof.evaluatedAt).toLocaleTimeString()} • Block #{proof.blockNumber || 42109841}
            </p>
          </div>
        </div>

        <a
          href={getBscScanAddressUrl(proof.evaluatorAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
        >
          <span>Evaluator: {truncateAddress(proof.evaluatorAddress)}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* State Diff Comparison Grid */}
      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-2">
          Verified State Transition ({proof.stateDiff.metric})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5">
            <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
              Before Execution (Drifted)
            </span>
            <span className="font-mono text-xs text-rose-200 font-semibold">
              {proof.stateDiff.before}
            </span>
          </div>

          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
              After Execution (Restored)
            </span>
            <span className="font-mono text-xs text-emerald-200 font-semibold">
              {proof.stateDiff.after}
            </span>
          </div>
        </div>
      </div>

      {/* Evaluator Report Note */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
        {proof.details}
      </p>

      {/* Cryptographic Hashes & Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-emerald-500/10">
        <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px]">
          <Hash className="h-3 w-3 text-emerald-400" />
          <span>Proof Hash: {truncateAddress(proof.proofHash, 10, 6)}</span>
        </div>

        <a
          href={getBscScanTxUrl(proof.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
        >
          <span>Inspect Execution Tx on BscScan</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
