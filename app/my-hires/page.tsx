'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Clock,
  ExternalLink,
  Play,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { HireJob, AltanaSession } from '@/lib/types';
import { getStoredJobs, getStoredSession } from '@/lib/storage';
import { verifyAndSettleJob } from '@/lib/evaluator';
import { formatUsd, truncateAddress, getBscScanTxUrl } from '@/lib/format';
import SessionPanel from '@/components/SessionPanel';
import ProofCard from '@/components/ProofCard';
import { useWallet } from '@/context/WalletContext';

function statusBadge(job: HireJob): { label: string; className: string } {
  if (job.status === 'completed' && !job.isSimulated && job.txHashes.evaluatorVerifyTx) {
    return {
      label: 'VERIFIED & SETTLED',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
  }
  if (job.status === 'funded' || job.status === 'submitted') {
    return {
      label: 'FUNDED IN ESCROW',
      className: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    };
  }
  if (job.status === 'intent' || job.isSimulated) {
    return {
      label: 'INTENT (NOT ON-CHAIN)',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
  }
  return {
    label: job.status.toUpperCase(),
    className: 'bg-slate-800 text-slate-300 border-slate-700',
  };
}

export default function MyHiresPage() {
  const { address, isConnected, openModal } = useWallet();
  const [jobs, setJobs] = useState<HireJob[]>([]);
  const [session, setSession] = useState<AltanaSession | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'intent'>('all');
  const [isEvaluatingId, setIsEvaluatingId] = useState<string | null>(null);
  const [evalMessage, setEvalMessage] = useState<string>('');

  const loadData = () => {
    setJobs(getStoredJobs());
    setSession(getStoredSession());
  };

  useEffect(() => {
    loadData();
    const onChange = () => loadData();
    window.addEventListener('fourcorners_jobs_changed', onChange);
    window.addEventListener('fourcorners_session_changed', onChange);
    return () => {
      window.removeEventListener('fourcorners_jobs_changed', onChange);
      window.removeEventListener('fourcorners_session_changed', onChange);
    };
  }, []);

  const handleTriggerVerification = async (jobId: string) => {
    setIsEvaluatingId(jobId);
    setEvalMessage('');
    try {
      await verifyAndSettleJob(jobId);
      setEvalMessage(
        'On-chain evaluator is not live yet. Job remains an intent — no settlement claimed.'
      );
      loadData();
    } catch (e: any) {
      console.error('Task verification error', e);
      setEvalMessage(e?.message || 'Verification unavailable');
    } finally {
      setIsEvaluatingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (address && j.clientAddress && j.clientAddress.toLowerCase() !== address.toLowerCase()) {
      return false;
    }
    if (activeFilter === 'all') return true;
    if (activeFilter === 'intent') return j.status === 'intent' || j.isSimulated;
    if (activeFilter === 'active')
      return j.status === 'funded' || j.status === 'submitted' || j.status === 'completed';
    return true;
  });

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('fourcorners_jobs_v2');
      setJobs([]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            <span>Agent Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Hires & Sessions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track hire intents and sessions. On-chain escrow labels only appear when real txs exist.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {!isConnected && (
            <button
              onClick={openModal}
              className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <Wallet className="h-4 w-4 text-amber-400" />
              <span>Connect Wallet</span>
            </button>
          )}
          <Link
            href="/"
            className="flex items-center space-x-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 hover:bg-amber-400 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Hire Another Agent</span>
          </Link>
        </div>
      </div>

      <SessionPanel session={session} onSessionUpdated={loadData} />

      {evalMessage && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs text-amber-200">
          {evalMessage}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Jobs</h2>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-300">
                {filteredJobs.length}
              </span>
            </div>
            {jobs.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors underline"
              >
                Clear history
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            {(['all', 'intent', 'active'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                  activeFilter === f
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'intent' ? 'Intents' : 'On-chain'}
              </button>
            ))}
          </div>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map((job) => {
              const badge = statusBadge(job);
              const canTryVerify =
                (job.status === 'intent' || job.status === 'funded' || job.status === 'submitted') &&
                !job.proof;

              return (
                <div
                  key={job.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-5 backdrop-blur-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                        {job.agentName.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">{job.agentName}</h3>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 uppercase">
                            {job.category}
                          </span>
                          {(job.isSimulated || job.status === 'intent') && (
                            <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-mono font-semibold">
                              INTENT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mt-0.5">
                          <span>Job ID: {job.id}</span>
                          <span>•</span>
                          <span>{new Date(job.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right font-mono">
                        <div className="text-sm font-bold text-white">{job.budgetBnb} tBNB</div>
                        <div className="text-[10px] text-slate-400">{formatUsd(job.budgetBnb)}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Task</span>
                    <p className="font-mono text-slate-300">{job.taskSpec}</p>
                  </div>

                  {(job.txHashes.escrowDepositTx ||
                    job.txHashes.agentExecutionTx ||
                    job.txHashes.evaluatorVerifyTx) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                      {job.txHashes.escrowDepositTx && (
                        <a
                          href={getBscScanTxUrl(job.txHashes.escrowDepositTx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800 text-amber-400 hover:underline flex items-center justify-between"
                        >
                          <span>{truncateAddress(job.txHashes.escrowDepositTx, 10, 6)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {job.txHashes.agentExecutionTx && (
                        <a
                          href={getBscScanTxUrl(job.txHashes.agentExecutionTx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800 text-sky-400 hover:underline flex items-center justify-between"
                        >
                          <span>{truncateAddress(job.txHashes.agentExecutionTx, 10, 6)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {job.txHashes.evaluatorVerifyTx && (
                        <a
                          href={getBscScanTxUrl(job.txHashes.evaluatorVerifyTx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800 text-emerald-400 hover:underline flex items-center justify-between"
                        >
                          <span>{truncateAddress(job.txHashes.evaluatorVerifyTx, 10, 6)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {job.proof && <ProofCard proof={job.proof} jobId={job.id} />}

                  {canTryVerify && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-slate-950 border border-slate-800 p-4">
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>
                          Pre-deploy path: verification will not claim on-chain settlement.
                        </span>
                      </div>
                      <button
                        onClick={() => handleTriggerVerification(job.id)}
                        disabled={isEvaluatingId === job.id}
                        className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all flex-shrink-0"
                      >
                        {isEvaluatingId === job.id ? (
                          <span>Checking…</span>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            <span>Check evaluator readiness</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <Layers className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="text-lg font-bold text-white">No hires yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {!isConnected
                ? 'Connect your wallet, then hire an agent from the marketplace.'
                : 'Browse agents across Rebalancing, Grid Trading, Yield, and Health Factor.'}
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Browse marketplace</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
