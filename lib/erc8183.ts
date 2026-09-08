import { HireJob, Agent } from './types';
import { CONTRACT_ADDRESSES, isContractsDeployed } from './wallet';
import { saveJob } from './storage';

export interface CreateHireParams {
  agent: Agent;
  clientAddress: string;
  budgetBnb: string;
  taskSpec: string;
  sessionKeyId?: string;
  durationHours?: number;
}

export class HireError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HireError';
  }
}

/**
 * Create a hire job. Real on-chain escrow only when contracts are deployed.
 * Never invents deposit transaction hashes.
 */
export async function hireErc8183Agent(params: CreateHireParams): Promise<HireJob> {
  const {
    agent,
    clientAddress,
    budgetBnb,
    taskSpec,
    sessionKeyId,
    durationHours = 24,
  } = params;

  if (!clientAddress || !/^0x[a-fA-F0-9]{40}$/.test(clientAddress)) {
    throw new HireError('Connect a real wallet before hiring an agent.');
  }

  if (!taskSpec?.trim()) {
    throw new HireError('Task specification is required.');
  }

  const localJobId = `fc-job-${Date.now().toString(36)}`;
  const now = new Date();
  const expiredAt = new Date(now.getTime() + durationHours * 3600 * 1000);

  // When contracts are live, this is the hook for real createJob + fund txs.
  // Until then: intent record only — status funded means "budget committed in UI intent",
  // not that native tBNB left the wallet.
  if (isContractsDeployed()) {
    // Placeholder for viem writeContract against ERC8183Escrow
    // Must return real tx hash from the wallet receipt — never Math.random.
  }

  const job: HireJob = {
    id: localJobId,
    agentId: agent.id,
    agentName: agent.name,
    category: agent.category,
    clientAddress,
    providerAddress: agent.providerAddress,
    evaluatorAddress: CONTRACT_ADDRESSES.evaluator,
    budgetBnb,
    status: isContractsDeployed() ? 'open' : 'funded',
    taskSpec,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiredAt: expiredAt.toISOString(),
    sessionKeyId,
    txHashes: {},
  };

  saveJob(job);
  return job;
}

/**
 * Agent submits work proof. Requires a real execution tx when on-chain path is live.
 */
export async function submitAgentProof(
  jobId: string,
  resultUri: string,
  executionTxHash?: string
): Promise<HireJob | null> {
  const { updateJob } = await import('./storage');

  if (isContractsDeployed() && !executionTxHash) {
    throw new HireError('On-chain mode requires a real agent execution transaction hash.');
  }

  return updateJob(jobId, {
    status: 'submitted',
    txHashes: executionTxHash
      ? { agentExecutionTx: executionTxHash }
      : {},
  });
}
