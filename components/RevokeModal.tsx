'use client';

import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, X, CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react';
import { revokeAltanaSession } from '@/lib/altana';
import { revokeStoredSession } from '@/lib/storage';
import { truncateAddress, getBscScanTxUrl } from '@/lib/format';

interface RevokeModalProps {
  sessionKeyId: string;
  isOpen: boolean;
  onClose: () => void;
  onRevoked: () => void;
}

export default function RevokeModal({ sessionKeyId, isOpen, onClose, onRevoked }: RevokeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [revocationTx, setRevocationTx] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmRevoke = async () => {
    setIsProcessing(true);
    try {
      const res = await revokeAltanaSession(sessionKeyId);
      revokeStoredSession(res.txHash);
      setRevocationTx(res.txHash);
      onRevoked();
    } catch (e) {
      console.error('Revocation failed', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5 text-rose-400">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Revoke Session Key</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {revocationTx ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Session Successfully Revoked</h4>
              <p className="text-xs text-slate-400 mt-1">
                The agent's delegation has been permanently invalidated in the BSC Keystore.
              </p>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 text-left font-mono text-xs text-slate-300 border border-slate-800">
              <div className="text-[10px] uppercase text-slate-500 mb-1">Revocation Transaction</div>
              <a
                href={getBscScanTxUrl(revocationTx)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline flex items-center justify-between"
              >
                <span>{truncateAddress(revocationTx, 12, 8)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200 leading-relaxed">
                Revoking this session will immediately disconnect the agent's delegation from the BSC Keystore. The agent will no longer be able to submit calls or interact with your escrow positions.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px] uppercase">Target Session Identifier</div>
              <div className="text-white font-bold">{sessionKeyId}</div>
              <div className="text-slate-500 text-[11px]">Network: BSC Testnet (Chain ID 97)</div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={isProcessing}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-600/20"
              >
                {isProcessing ? (
                  <span>Revoking on-chain...</span>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Confirm Revocation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
