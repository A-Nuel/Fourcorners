'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  Clock, 
  Wallet, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Agent, AltanaSession } from '@/lib/types';
import { grantAltanaSession } from '@/lib/altana';
import { hireErc8183Agent } from '@/lib/erc8183';
import { saveSession, saveJob } from '@/lib/storage';
import { truncateAddress, formatBnb, formatUsd, getBscScanTxUrl } from '@/lib/format';
import { CONTRACT_ADDRESSES } from '@/lib/wallet';

interface HireWizardProps {
  agent: Agent;
}

export default function HireWizard({ agent }: HireWizardProps) {
  const router = useRouter();

  // Wizard Steps: 1: Wallet, 2: Session Limits, 3: Keystore Grant, 4: Escrow Fund & Complete
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [walletAddress, setWalletAddress] = useState<string>('0x32759604104c810E3B68565b939E8b64e0303E8A');
  const [spendCap, setSpendCap] = useState<string>('0.05');
  const [durationHours, setDurationHours] = useState<number>(24);
  const [taskInstruction, setTaskInstruction] = useState<string>(agent.sampleTask);
  const [inputValues, setInputValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    agent.inputParameters.forEach((p) => {
      initial[p.name] = p.default;
    });
    return initial;
  });

  // Async Execution State
  const [isGrantingSession, setIsGrantingSession] = useState<boolean>(false);
  const [grantedSession, setGrantedSession] = useState<AltanaSession | null>(null);
  const [isFundingEscrow, setIsFundingEscrow] = useState<boolean>(false);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);

  // Step 1: Connect Wallet
  const handleConnect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
        }
      } catch (e) {
        console.warn('Injected wallet request rejected', e);
      }
    }
    setCurrentStep(2);
  };

  // Step 2 -> Step 3: Grant Session
  const handleGrantSession = async () => {
    setIsGrantingSession(true);
    try {
      const session = await grantAltanaSession({
        ownerAddress: walletAddress,
        spendCapBnb: spendCap,
        durationHours,
        allowedContracts: [CONTRACT_ADDRESSES.escrow, CONTRACT_ADDRESSES.evaluator],
      });
      setGrantedSession(session);
      saveSession(session);
      setCurrentStep(3);
    } catch (e) {
      console.error('Failed to grant session', e);
    } finally {
      setIsGrantingSession(false);
    }
  };

  // Step 3 -> Step 4: Fund Escrow & Hire
  const handleConfirmHire = async () => {
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

      // Trigger automatic agent task execution in background
      try {
        fetch(`/api/agents/${agent.id}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.id,
            inputParams: inputValues,
            budgetBnb: agent.minBudget,
          }),
        }).catch(console.error);
      } catch (e) {
        console.warn('Non-blocking execute trigger', e);
      }

      setCurrentStep(4);
    } catch (e) {
      console.error('Escrow hire error', e);
    } finally {
      setIsFundingEscrow(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span className={currentStep >= 1 ? 'text-amber-400' : ''}>1. Wallet</span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className={currentStep >= 2 ? 'text-sky-400' : ''}>2. Altana Session</span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className={currentStep >= 3 ? 'text-emerald-400' : ''}>3. Keystore Grant</span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className={currentStep >= 4 ? 'text-white' : ''}>4. Escrow Lock</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-sky-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP 1: Connect Wallet */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-xl font-bold text-white">Connect Client Account</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select the account funding the agentic hire on BSC Testnet (Chain ID 97).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Account Address</span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Ready
              </span>
            </div>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Browser wallet, Altana agentic wallet, or testnet demo address supported.
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <span>Proceed to Session Limits</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Configure Altana Session Limits */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Stripe-Grade Altana Authorization</span>
            </div>
            <h3 className="text-xl font-bold text-white">Configure Scoped Session Limits</h3>
            <p className="text-xs text-slate-400 mt-1">
              Define the exact boundaries the agent is authorized to execute within. The agent never gets your private keys.
            </p>
          </div>

          {/* Spend Cap */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Maximum Spend Cap</label>
              <span className="font-mono text-xs text-amber-400 font-bold">{spendCap} tBNB ({formatUsd(spendCap)})</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.20"
              step="0.01"
              value={spendCap}
              onChange={(e) => setSpendCap(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.02 tBNB (Min)</span>
              <span>0.10 tBNB (Recommended)</span>
              <span>0.20 tBNB (Max)</span>
            </div>
          </div>

          {/* Expiry Window */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <label className="text-xs font-semibold text-slate-200 block">Session Expiry Window</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '1 Hour', hours: 1 },
                { label: '24 Hours', hours: 24 },
                { label: '7 Days', hours: 168 },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setDurationHours(opt.hours)}
                  className={`rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
                    durationHours === opt.hours
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-md shadow-sky-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Allowlist Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                Contract Call Allowlist
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Strictly Enforced</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Agent authority is locked strictly to the <span className="font-mono text-slate-300">ERC8183Escrow</span> contract ({truncateAddress(CONTRACT_ADDRESSES.escrow)}) and protocol interactions. Any unauthorized calls will fail.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="rounded-xl bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleGrantSession}
              disabled={isGrantingSession}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 transition-all"
            >
              {isGrantingSession ? (
                <span>Registering in Keystore...</span>
              ) : (
                <>
                  <span>Grant Scoped Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Keystore Registration & Escrow Review */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Session Registered in Keystore</span>
            </div>
            <h3 className="text-xl font-bold text-white">Review & Lock Escrow</h3>
            <p className="text-xs text-slate-400 mt-1">
              Payment is held securely in the ERC-8183 Escrow contract. Funds are only released to {agent.name} after the Evaluator verifies work on-chain.
            </p>
          </div>

          {/* Escrow Terms Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Agent Gig</span>
              <span className="text-white font-bold">{agent.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Escrow Payment Locked</span>
              <span className="font-mono text-amber-400 font-bold">
                {agent.minBudget} tBNB ({formatUsd(agent.minBudget)})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Verification Authority</span>
              <span className="font-mono text-emerald-400">TaskEvaluator Contract</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Session Key ID</span>
              <span className="font-mono text-sky-400 text-[11px]">
                {grantedSession?.sessionKeyId}
              </span>
            </div>
          </div>

          {/* Task Instructions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">Task Parameters / Instructions</label>
            <textarea
              rows={2}
              value={taskInstruction}
              onChange={(e) => setTaskInstruction(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="rounded-xl bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirmHire}
              disabled={isFundingEscrow}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all"
            >
              {isFundingEscrow ? (
                <span>Locking Escrow on BSC...</span>
              ) : (
                <>
                  <span>Deposit Escrow & Start Job</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success & Redirect */}
      {currentStep === 4 && (
        <div className="text-center py-6 space-y-5 animate-in fade-in duration-300">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">Agent Hired & Escrow Funded!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your job has been created on BSC Testnet. {agent.name} is now executing your task within the authorized Altana session limits.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left font-mono text-xs space-y-2">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Job Identifier:</span>
              <span className="text-white font-bold">{completedJobId}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">Funded in Escrow</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Evaluator Check:</span>
              <span className="text-slate-300">Active</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/my-hires')}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center space-x-2"
          >
            <span>Open Agent Control Center</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
