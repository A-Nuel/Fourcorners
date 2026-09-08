'use client';

import React from 'react';
import { ShieldCheck, ExternalLink, Hash } from 'lucide-react';
import { VerificationProof } from '@/lib/types';
import { truncateAddress, getBscScanTxUrl, getBscScanAddressUrl } from '@/lib/format';

interface ProofCardProps {
  proof: VerificationProof;
  jobId: string;
}

export default function ProofCard({ proof }: ProofCardProps) {
  const onChain =
    proof.onChain === true ||
    (Boolean(proof.txHash) &&
      /^0x[a-fA-F0-9]{64}$/.test(proof.txHash) &&
      !proof.isSimulated);

  return (
    <div
      className={`rounded-2xl border p-5 shadow-xl ${
        onChain
          ? 'border-emerald-500/30 bg-emerald-950/20'
          : 'border-amber-500/30 bg-amber-950/10'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              onChain ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                onChain ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              <span>Task evaluator</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                  onChain
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-200'
                }`}
              >
                {onChain ? 'VERIFIED ON-CHAIN' : 'LOCAL / INTENT ONLY'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Evaluated: {new Date(proof.evaluatedAt).toLocaleTimeString()}
              {onChain && proof.blockNumber ? ` • Block #${proof.blockNumber}` : ''}
            </p>
          </div>
        </div>

        {onChain && (
          <a
            href={getBscScanAddressUrl(proof.evaluatorAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
          >
            <span>Evaluator: {truncateAddress(proof.evaluatorAddress)}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-2">
          State note ({proof.stateDiff.metric})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Before</span>
            <span className="font-mono text-xs text-slate-200">{proof.stateDiff.before}</span>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">After</span>
            <span className="font-mono text-xs text-slate-200">{proof.stateDiff.after}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
        {proof.details}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800">
        {proof.proofHash ? (
          <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px]">
            <Hash className="h-3 w-3 text-emerald-400" />
            <span>Proof: {truncateAddress(proof.proofHash, 10, 6)}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">No proof hash</span>
        )}

        {onChain && proof.txHash ? (
          <a
            href={getBscScanTxUrl(proof.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:underline"
          >
            <span>Inspect tx on BscScan</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-xs text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
            No on-chain receipt
          </span>
        )}
      </div>
    </div>
  );
}
