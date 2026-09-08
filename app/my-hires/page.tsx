'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RotateCcw,
  Sparkles,
  Search,
  Wallet
} from 'lucide-react';
import { HireJob, AltanaSession } from '@/lib/types';
import { getStoredJobs, getStoredSession, updateJob } from '@/lib/storage';
import { verifyAndSettleJob } from '@/lib/evaluator';
import { formatBnb, formatUsd, truncateAddress, getBscScanTxUrl } from '@/lib/format';
import SessionPanel from '@/components/SessionPanel';
import ProofCard from '@/components/ProofCard';
import { useWallet } from '@/context/WalletContext';

export default function MyHiresPage() {
  const { address, isConnected, openModal } = useWallet();
  const [jobs, setJobs] = useState<HireJob[]>([]);
  const [session, setSession] = useState<AltanaSession | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'funded' | 'completed'>('all');
  const [isEvaluatingId, setIsEvaluatingId] = useState<string | null>(null);

  const loadData = () => {
    setJobs(getStoredJobs());
    setSession(getStoredSession());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Trigger agent execution and on-chain verification
  const handleTriggerVerification = async (jobId: string) => {
    setIsEvaluatingId(jobId);
    try {
      await verifyAndSettleJob(jobId);
      loadData();
    } catch (e) {
      console.error('Task verification error', e);
    } finally {
      setIsEvaluatingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (address && j.clientAddress && j.clientAddress.toLowerCase() !== address.toLowerCase()) {
      return false;
    }
    if (activeFilter === 'all') return true;
    if (activeFilter === 'funded') return j.status === 'funded' || j.status === 'submitted';
    if (activeFilter === 'completed') return j.status === 'completed';
    return true;
  });

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fourcorners_hire_jobs_v2');
      setJobs([]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Control Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            <span>Agent Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Hires & Active Sessions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor autonomous execution, inspect on-chain evaluator proofs, and manage Altana session authorizations on BSC Testnet.
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

      {/* Altana Session Telemetry Card */}
      <SessionPanel session={session} onSessionUpdated={loadData} />

      {/* Jobs Section Header & Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Escrow Jobs History</h2>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-300">
                {filteredJobs.length} Total
              </span>
            </div>
            {jobs.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors underline"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setActiveFilter('funded')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                activeFilter === 'funded'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Funded Escrow
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                activeFilter === 'completed'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Verified Proofs ✅
            </button>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map((job) => {
              const isCompleted = job.status === 'completed';
              const isFunded = job.status === 'funded' || job.status === 'submitted';

              return (
                <div
                  key={job.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-5 backdrop-blur-md"
                >
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                        {job.agentName.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-white">{job.agentName}</h3>
                          <span className="rounded bg-slate-800 px-2 py-0.2 text-[10px] font-mono text-slate-400 uppercase">
                            {job.category}
                          </span>
                          {job.isSimulated && (
                            <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 text-[9px] font-mono font-semibold">
                              SANDBOX
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

                      <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {isCompleted ? 'VERIFIED & SETTLED' : 'FUNDED IN ESCROW'}
                      </span>
                    </div>
                  </div>

                  {/* Task Instructions */}
                  <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Task Instructions Passed to Agent
                    </span>
                    <p className="font-mono text-slate-300">{job.taskSpec}</p>
                  </div>

                  {/* Transaction Explorer Hashes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                    {job.txHashes.escrowDepositTx && (
                      <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block mb-0.5">ERC-8183 Deposit Tx</span>
                        <a
                          href={getBscScanTxUrl(job.txHashes.escrowDepositTx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline flex items-center justify-between"
                        >
                          <span>{truncateAddress(job.txHashes.escrowDepositTx, 10, 6)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {job.txHashes.agentExecutionTx && (
                      <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block mb-0.5">Agent Execution Tx</span>
                        <a
                          href={getBscScanTxUrl(job.txHashes.agentExecutionTx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:underline flex items-center justify-between"
                        >
                          <span>{truncateAddress(job.txHashes.agentExecutionTx, 10, 6)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {job.txHashes.evaluatorVerifyTx && (
                      <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block mb-0.5">TaskEvaluator Release Tx</span>
                        <a
                          href={getBscScanTxUrl(job.txHashes.evaluatorVerifyTx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center justify-between"
                        >
                          <span>{truncateAddress(job.txHashes.evaluatorVerifyTx, 10, 6)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* On-Chain Proof Card (If Evaluated) */}
                  {job.proof && <ProofCard proof={job.proof} jobId={job.id} />}

                  {/* Trigger Verification Button (If funded but not yet evaluated) */}
                  {isFunded && !job.proof && (
                    <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                      <div className="flex items-center space-x-2 text-xs text-amber-200">
                        <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>
                          Agent execution in progress. You can trigger on-chain evaluation and settlement now.
                        </span>
                      </div>
                      <button
                        onClick={() => handleTriggerVerification(job.id)}
                        disabled={isEvaluatingId === job.id}
                        className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-emerald-400 hover:to-emerald-500 transition-all flex-shrink-0"
                      >
                        {isEvaluatingId === job.id ? (
                          <span>Verifying On-Chain...</span>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            <span>Verify & Release Escrow</span>
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
            <h3 className="text-lg font-bold text-white">No active agent contracts found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {!isConnected
                ? 'Connect your Web3 wallet to inspect your active agent sessions, on-chain evaluation proofs, and escrow balances.'
                : 'You have not hired any autonomous agents yet. Browse our specialized agents across Rebalancing, Grid Trading, Yield, and Health Factor.'}
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Browse Agent Marketplace</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
