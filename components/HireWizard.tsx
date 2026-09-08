'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Key,
  Lock,
  ArrowRight,
  CheckCircle2,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { Agent, AltanaSession } from '@/lib/types';
import { grantAltanaSession } from '@/lib/altana';
import { hireErc8183Agent } from '@/lib/erc8183';
import { saveSession } from '@/lib/storage';
import { truncateAddress, formatBnb } from '@/lib/format';
import { CONTRACT_ADDRESSES, isContractsDeployed } from '@/lib/wallet';
import {
  connectWallet,
  getConnectedAccount,
  ensureBscTestnet,
  WalletError,
} from '@/lib/walletConnect';

interface HireWizardProps {
  agent: Agent;
}

export default function HireWizard({ agent }: HireWizardProps) {
  const router = useRouter();
  const contractsLive = isContractsDeployed();

  const [currentStep, setCurrentStep] = useState(1);
  const [walletAddress, setWalletAddress] = useState('');
  const [spendCap, setSpendCap] = useState('0.05');
  const [durationHours, setDurationHours] = useState(24);
  const [taskInstruction, setTaskInstruction] = useState(agent.sampleTask);
  const [inputValues, setInputValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    agent.inputParameters.forEach((p) => {
      initial[p.name] = p.default;
    });
    return initial;
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isGrantingSession, setIsGrantingSession] = useState(false);
  const [grantedSession, setGrantedSession] = useState<AltanaSession | null>(null);
  const [isFundingEscrow, setIsFundingEscrow] = useState(false);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getConnectedAccount().then((addr) => {
      if (addr) setWalletAddress(addr);
    });
  }, []);

  const handleConnect = async () => {
    setError('');
    setIsConnecting(true);
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
      setCurrentStep(2);
    } catch (e: any) {
      setError(
        e instanceof WalletError
          ? e.message
          : e?.message || 'Could not connect wallet'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGrantSession = async () => {
    setError('');
    if (!walletAddress) {
      setError('Connect a wallet first.');
      return;
    }
    setIsGrantingSession(true);
    try {
      await ensureBscTestnet();
      const session = await grantAltanaSession({
        ownerAddress: walletAddress,
        spendCapBnb: spendCap,
        durationHours,
        allowedContracts: [CONTRACT_ADDRESSES.escrow, CONTRACT_ADDRESSES.evaluator],
      });
      setGrantedSession(session);
      saveSession(session);
      setCurrentStep(3);
    } catch (e: any) {
      setError(e?.message || 'Session grant failed');
    } finally {
      setIsGrantingSession(false);
    }
  };

  const handleConfirmHire = async () => {
    setError('');
    if (!walletAddress) {
      setError('Connect a wallet first.');
      return;
    }
    setIsFundingEscrow(true);
    try {
      const job = await hireErc8183Agent({
        agent,
        clientAddress: walletAddress,
        budgetBnb: agent.minBudget,
        taskSpec: taskInstruction,
        sessionKeyId: grantedSession?.sessionKeyId,
        durationHours,
      });

      setCompletedJobId(job.id);

      // Fire-and-forget execution intent — no fabricated tx hashes
      fetch(`/api/agents/${agent.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          inputParams: inputValues,
          budgetBnb: agent.minBudget,
        }),
      }).catch(console.error);

      setCurrentStep(4);
    } catch (e: any) {
      setError(e?.message || 'Hire failed');
    } finally {
      setIsFundingEscrow(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-5">
      {/* Honest status banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200/90 flex items-start gap-2">
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          {contractsLive
            ? 'On-chain escrow contracts are configured.'
            : 'Escrow contracts are not deployed yet. This flow records a hire intent and session limits only — it will not move tBNB or create explorer txs until contracts go live.'}
        </span>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-400">
        {['Wallet', 'Session Limits', 'Authorize', 'Confirm'].map((label, i) => {
          const step = i + 1;
          const active = currentStep === step;
          const done = currentStep > step;
          return (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  done
                    ? 'bg-emerald-500 text-slate-950'
                    : active
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {done ? '✓' : step}
              </span>
              <span className={active ? 'text-white' : ''}>{label}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Step 1 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Connect client wallet</h3>
            <p className="text-xs text-slate-400 mt-1">
              EIP-1193 browser wallet on BSC Testnet (chain 97). No demo addresses.
            </p>
          </div>
          {walletAddress ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
              <div className="text-emerald-400 text-xs font-semibold mb-1">Connected</div>
              <div className="font-mono text-white text-xs">{walletAddress}</div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Install MetaMask / Rabby / Trust, fund with tBNB from a faucet, then connect.
            </p>
          )}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
          >
            <Wallet className="h-4 w-4" />
            {isConnecting
              ? 'Connecting…'
              : walletAddress
              ? 'Continue with connected wallet'
              : 'Connect Wallet'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2 */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Session limits</h3>
            <p className="text-xs text-slate-400 mt-1">
              Scope what the agent may spend and for how long.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs space-y-1">
              <span className="text-slate-400">Spend cap (tBNB)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={spendCap}
                onChange={(e) => setSpendCap(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs space-y-1">
              <span className="text-slate-400">Duration (hours)</span>
              <input
                type="number"
                min={1}
                max={168}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value) || 24)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>
          <label className="block text-xs space-y-1">
            <span className="text-slate-400">Task instruction</span>
            <textarea
              value={taskInstruction}
              onChange={(e) => setTaskInstruction(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          {agent.inputParameters.map((p) => (
            <label key={p.name} className="block text-xs space-y-1">
              <span className="text-slate-400">{p.name}</span>
              <input
                value={String(inputValues[p.name] ?? '')}
                onChange={(e) =>
                  setInputValues((prev) => ({ ...prev, [p.name]: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono"
              />
            </label>
          ))}
          <button
            onClick={handleGrantSession}
            disabled={isGrantingSession}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
          >
            <Key className="h-4 w-4" />
            {isGrantingSession ? 'Authorizing…' : 'Authorize session limits'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 3 */}
      {currentStep === 3 && grantedSession && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Review & confirm</h3>
            <p className="text-xs text-slate-400 mt-1">
              {grantedSession.keystoreRegistered
                ? 'Session registered on-chain.'
                : 'Session limits recorded as an intent (Keystore registration pending live Altana wiring).'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Client</span>
              <span className="text-white">{truncateAddress(walletAddress)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Spend cap</span>
              <span className="text-white">{formatBnb(spendCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Budget</span>
              <span className="text-white">{formatBnb(agent.minBudget)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Keystore</span>
              <span className={grantedSession.keystoreRegistered ? 'text-emerald-400' : 'text-amber-400'}>
                {grantedSession.keystoreRegistered ? 'Registered' : 'Intent only'}
              </span>
            </div>
          </div>
          <button
            onClick={handleConfirmHire}
            disabled={isFundingEscrow}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {isFundingEscrow
              ? 'Recording hire…'
              : contractsLive
              ? 'Fund escrow & start job'
              : 'Confirm hire intent'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 4 */}
      {currentStep === 4 && (
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {contractsLive ? 'Job submitted' : 'Hire intent recorded'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {contractsLive
                ? `${agent.name} is authorized within your session limits.`
                : `No on-chain transfer occurred. When escrow contracts deploy, this same flow will lock budget on BSC Testnet.`}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-left text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Job ID</span>
              <span className="text-white font-mono">{completedJobId}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mode</span>
              <span className="text-amber-300">{contractsLive ? 'On-chain' : 'Intent (pre-deploy)'}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/my-hires')}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-slate-950 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Open control center
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
