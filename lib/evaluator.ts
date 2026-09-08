import { HireJob, VerificationProof } from './types';
import { updateJob, getStoredJobs } from './storage';
import { CONTRACT_ADDRESSES, isContractsDeployed } from './wallet';

/** TaskEvaluator client — does not invent on-chain proofs. */
export async function verifyAndSettleJob(jobId: string): Promise<HireJob | null> {
  const jobs = getStoredJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  if (isContractsDeployed()) {
    throw new Error(
      'On-chain evaluator path enabled but not wired. Refusing to invent a settlement tx.'
    );
  }

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
