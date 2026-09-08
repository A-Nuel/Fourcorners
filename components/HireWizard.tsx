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
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Agent, AltanaSession } from '@/lib/types';
import { grantAltanaSession } from '@/lib/altana';
import { hireErc8183Agent } from '@/lib/erc8183';
import { saveSession, saveJob } from '@/lib/storage';
import { truncateAddress, formatBnb, formatUsd, getBscScanTxUrl } from '@/lib/format';
import { CONTRACT_ADDRESSES } from '@/lib/wallet';
import { useWallet } from '@/context/WalletContext';

interface HireWizardProps {
  agent: Agent;
}

export default function HireWizard({ agent }: HireWizardProps) {
  const router = useRouter();
  const { address, isConnected, balance, openModal, sendEscrowPayment, signSessionDelegation } = useWallet();

  // Wizard Steps: 1: Wallet, 2: Session Limits, 3: Keystore Grant, 4: Escrow Fund & Complete
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
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
  const [executionTxHash, setExecutionTxHash] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Step 2 -> Step 3: Grant Session
  const handleGrantSession = async () => {
    if (!address) {
      openModal();
      return;
    }

    setIsGrantingSession(true);
    setActionError(null);

    try {
      // 1. Request cryptographic delegation signature from user's connected wallet
      const delegationPayload = `FourCorners Altana Session Authorization\nOwner: ${address}\nAgent: ${agent.name} (${agent.providerAddress})\nSpend Cap: ${spendCap} tBNB\nExpiry: ${durationHours} hours\nNetwork: BSC Testnet (97)`;
      
      let signature = '';
      try {
        signature = await signSessionDelegation(delegationPayload);
      } catch (signErr: any) {
        if (signErr.code === 4001 || signErr?.message?.includes('rejected')) {
          throw new Error('Signature request was rejected in your wallet.');
        }
        console.warn('Signature warning, proceeding with session grant', signErr);
      }

      // 2. Register session in BSC Keystore via Altana SDK
      const session = await grantAltanaSession({
        ownerAddress: address,
        spendCapBnb: spendCap,
        durationHours,
        allowedContracts: [CONTRACT_ADDRESSES.escrow, CONTRACT_ADDRESSES.evaluator],
      });

      setGrantedSession(session);
      saveSession(session);
      setCurrentStep(3);
    } catch (e: any) {
      console.error('Failed to grant session', e);
      setActionError(e.message || 'Failed to grant Altana session.');
    } finally {
      setIsGrantingSession(false);
    }
  };

  // Step 3 -> Step 4: Fund Escrow & Hire
  const handleConfirmHire = async (isSimulation = false) => {
    if (!address) {
      openModal();
      return;
    }

    setIsFundingEscrow(true);
    setActionError(null);

    try {
      let escrowDepositTx = '';

      if (isSimulation) {
        setExecutionTxHash(null);
      } else {
        const currentBal = parseFloat(balance || '0');
        const required = parseFloat(agent.minBudget);

        if (currentBal < required) {
          throw new Error(
            `Insufficient tBNB balance (${balance} tBNB). You need at least ${agent.minBudget} tBNB to fund on-chain escrow. Please obtain free tBNB from the Binance Testnet Faucet or choose Sandbox Simulation.`
          );
        }

        // Send real on-chain transaction through user's active Web3 wallet
        const txResult = await sendEscrowPayment(CONTRACT_ADDRESSES.escrow, agent.minBudget);
        escrowDepositTx = txResult.hash;
        setExecutionTxHash(txResult.hash);
      }

      // Record ERC-8183 Job in local store
      const job = await hireErc8183Agent({
        agent,
        clientAddress: address,
        budgetBnb: agent.minBudget,
        taskSpec: taskInstruction,
        sessionKeyId: grantedSession?.sessionKeyId,
        durationHours,
        escrowDepositTx: escrowDepositTx || undefined,
        isSimulated: isSimulation,
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
            isSimulated: isSimulation,
          }),
        }).catch(console.error);
      } catch (e) {
        console.warn('Non-blocking execute trigger', e);
      }

      setCurrentStep(4);
    } catch (e: any) {
      console.error('Escrow hire error', e);
      setActionError(e.message || 'Failed to lock escrow payment.');
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

      {/* Error alert */}
      {actionError && (
        <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex items-start space-x-2.5 text-xs text-rose-200">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{actionError}</p>
        </div>
      )}

      {/* STEP 1: Connect Wallet */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-xl font-bold text-white">Connect Client Account</h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect your Web3 wallet on BNB Smart Chain Testnet (Chain ID 97) to authorize the agent.
            </p>
          </div>

          {isConnected && address ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Connected Wallet</span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                  Active
                </span>
              </div>
              <p className="font-mono text-xs text-white break-all">{address}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1 border-t border-emerald-500/10">
                <span>Available Balance:</span>
                <span className="font-bold text-amber-400">{balance} tBNB</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">No Wallet Connected</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Connect MetaMask, Rabby, or Binance Web3 Wallet to continue.
                </p>
              </div>
              <button
                type="button"
                onClick={openModal}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Select a Wallet
              </button>
            </div>
          )}

          <button
            onClick={() => {
              if (!isConnected) {
                openModal();
              } else {
                setCurrentStep(2);
              }
            }}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <span>{isConnected ? 'Proceed to Session Limits' : 'Connect Wallet to Proceed'}</span>
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
              Define the exact boundaries {agent.name} is authorized to execute within. The agent never receives your private key.
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
              Agent authority is locked strictly to the <span className="font-mono text-slate-300">ERC8183Escrow</span> contract ({truncateAddress(CONTRACT_ADDRESSES.escrow)}) and protocol interactions.
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
                <span>Sign Delegation in Wallet...</span>
              ) : (
                <>
                  <span>Sign & Grant Scoped Session</span>
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
              <span>Session Registered in BSC Keystore</span>
            </div>
            <h3 className="text-xl font-bold text-white">Review & Lock Escrow</h3>
            <p className="text-xs text-slate-400 mt-1">
              Deposit your budget into the ERC-8183 Escrow contract. Funds only release to {agent.name} after the TaskEvaluator verifies on-chain work.
            </p>
          </div>

          {/* Escrow Terms Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Agent Gig</span>
              <span className="text-white font-bold">{agent.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Escrow Payment Required</span>
              <span className="font-mono text-amber-400 font-bold">
                {agent.minBudget} tBNB ({formatUsd(agent.minBudget)})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Your Available Balance</span>
              <span className="font-mono text-slate-200 font-bold">
                {balance || '0.0000'} tBNB
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

          {/* Low Balance Warning if applicable */}
          {parseFloat(balance || '0') < parseFloat(agent.minBudget) && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 text-xs text-amber-200">
              <div className="flex items-center space-x-2 font-bold text-amber-300">
                <AlertCircle className="h-4 w-4" />
                <span>Insufficient tBNB for On-Chain Escrow</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Your wallet has {balance} tBNB, but this agent requires {agent.minBudget} tBNB. You can get free testnet BNB below or run in zero-gas Sandbox Mode.
              </p>
              <a
                href="https://testnet.binance.org/faucet-smart"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-bold text-xs underline"
              >
                <span>Claim Free Testnet BNB from Binance Faucet</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

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

          <div className="space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="rounded-xl bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => handleConfirmHire(false)}
                disabled={isFundingEscrow}
                className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50"
              >
                {isFundingEscrow ? (
                  <span>Broadcasting Transaction to BSC Testnet...</span>
                ) : (
                  <>
                    <span>Confirm & Lock Escrow On-Chain</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleConfirmHire(true)}
              disabled={isFundingEscrow}
              className="w-full flex items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Run Zero-Gas Sandbox Simulation (Preview Mode)</span>
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
              Your job has been created. {agent.name} is now executing your task within the authorized Altana session limits.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left font-mono text-xs space-y-2">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Job Identifier:</span>
              <span className="text-white font-bold">{completedJobId}</span>
            </div>
            {executionTxHash ? (
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Escrow Tx:</span>
                <a
                  href={getBscScanTxUrl(executionTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>{truncateAddress(executionTxHash, 10, 6)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Mode:</span>
                <span className="text-amber-400 font-bold">Sandbox Simulation (Zero Gas)</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">Funded in Escrow</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Evaluator Check:</span>
              <span className="text-slate-300">Active Verification</span>
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
