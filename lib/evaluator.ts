import { HireJob, VerificationProof } from './types';
import { updateJob, getStoredJobs } from './storage';
import { CONTRACT_ADDRESSES, isContractsDeployed } from './wallet';

/**
 * TaskEvaluator client.
 * Does not invent on-chain proofs or block numbers.
 * When contracts are not deployed, marks local verification only.
 */
export async function verifyAndSettleJob(jobId: string): Promise<HireJob | null> {
  const jobs = getStoredJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  if (isContractsDeployed()) {
    // Real path: read evaluator contract / job status on-chain.
    // Do not fabricate receipts.
    throw new Error(
      'On-chain evaluator path is enabled but not yet wired. Refusing to invent a settlement tx.'
    );
  }

  // Local intent verification only — clearly not on-chain
  const proof: VerificationProof = {
    proofHash: '',
    txHash: job.txHashes.agentExecutionTx || '',
    evaluatedAt: new Date().toISOString(),
    stateDiff: {
      metric: 'Local intent check',
      before: 'Job funded (intent)',
      after: 'Marked complete locally — not settled on-chain',
    },
    evaluatorAddress: CONTRACT_ADDRESSES.evaluator,
    passed: true,
    details:
      'Local verification only. Escrow contracts are not deployed on BSC Testnet yet. No on-chain settlement occurred.',
  };

  return updateJob(jobId, {
    status: 'completed',
    proof,
  });
}
