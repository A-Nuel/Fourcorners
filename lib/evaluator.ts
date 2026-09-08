import { HireJob } from './types';
import { updateJob, getStoredJobs } from './storage';
import { isContractsDeployed } from './wallet';

/**
 * TaskEvaluator client.
 * Does not invent on-chain proofs or mark jobs settled without a receipt.
 */
export async function verifyAndSettleJob(jobId: string): Promise<HireJob | null> {
  const jobs = getStoredJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  if (isContractsDeployed()) {
    throw new Error(
      'On-chain evaluator path is configured but not wired. Refusing to invent a settlement tx.'
    );
  }

  // Pre-deploy: do NOT attach a proof object and do NOT claim completed/settled.
  // Keep status as intent so UI cannot show VERIFIED ON-CHAIN / FUNDED IN ESCROW.
  return updateJob(jobId, {
    status: 'intent',
    isSimulated: true,
    proof: undefined,
  });
}
