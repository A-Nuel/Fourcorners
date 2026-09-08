'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Key, RotateCcw, ExternalLink, Lock } from 'lucide-react';
import { AltanaSession } from '@/lib/types';
import { truncateAddress, formatTimeRemaining, getBscScanTxUrl } from '@/lib/format';
import RevokeModal from './RevokeModal';

interface SessionPanelProps {
  session: AltanaSession | null;
  onSessionUpdated?: () => void;
}

export default function SessionPanel({ session, onSessionUpdated }: SessionPanelProps) {
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!session) return;
    setTimeLeft(formatTimeRemaining(session.expiryTimestamp));
    const interval = setInterval(() => {
      setTimeLeft(formatTimeRemaining(session.expiryTimestamp));
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 mb-3">
          <Key className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-white">No active session</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          When you hire an agent, session limits (spend cap, expiry, allowlist) are recorded. On-chain Keystore registration appears here once Altana is live.
        </p>
      </div>
    );
  }

  const isRevoked = session.status === 'revoked';
  const isOnChain = session.keystoreRegistered && Boolean(session.txHash);
  const spent = parseFloat(session.spentBnb || '0');
  const cap = parseFloat(session.spendCapBnb || '0.05');
  const percentUsed = Math.min(100, Math.round((spent / Math.max(cap, 0.0001)) * 100));

  const badgeLabel = isRevoked
    ? 'REVOKED'
    : isOnChain
    ? 'ACTIVE IN KEYSTORE'
    : 'INTENT (NOT ON-CHAIN)';

  return (
    <>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isRevoked
                  ? 'bg-rose-500/10 text-rose-400'
                  : isOnChain
                  ? 'bg-sky-500/10 text-sky-400'
                  : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Session limits
                </h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    isRevoked
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : isOnChain
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {badgeLabel}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Key ID: {session.sessionKeyId}
              </p>
            </div>
          </div>

          {!isRevoked && (
            <button
              onClick={() => setShowRevokeModal(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Revoke</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Spend ceiling</span>
              <span className="font-mono text-white font-bold">{session.spendCapBnb} tBNB</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all ${isRevoked ? 'bg-slate-600' : 'bg-gradient-to-r from-sky-400 to-amber-400'}`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>Spent: {session.spentBnb} tBNB</span>
              <span>{percentUsed}% used</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Session window</span>
            </div>
            <div className="font-mono text-sm font-bold text-white mt-1">
              {isRevoked ? 'Invalidated' : timeLeft}
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Call allowlist</span>
            </div>
            <div className="text-xs font-mono text-slate-200 mt-1 truncate">
              {session.allowedContracts.length} target contracts
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span className="font-mono">
            {isOnChain
              ? 'Registered on BSC Testnet (97)'
              : 'Local intent only — not registered in Keystore yet'}
          </span>
          {isOnChain ? (
            <a
              href={getBscScanTxUrl(session.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sky-400 hover:underline"
            >
              <span>View registration tx</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-amber-400/80">No explorer link until on-chain</span>
          )}
        </div>
      </div>

      <RevokeModal
        sessionKeyId={session.sessionKeyId}
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        onRevoked={() => {
          if (onSessionUpdated) onSessionUpdated();
        }}
      />
    </>
  );
}
