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
  escrowDepositTx?: string;
  isSimulated?: boolean;
}

export class HireError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HireError';
  }
}

/** Create hire job. Never invents deposit tx hashes. */
export async function hireErc8183Agent(params: CreateHireParams): Promise<HireJob> {
  const {
    agent,
    clientAddress,
    budgetBnb,
    taskSpec,
    sessionKeyId,
    durationHours = 24,
    escrowDepositTx,
    isSimulated = false,
  } = params;

  if (!clientAddress || !/^0x[a-fA-F0-9]{40}$/.test(clientAddress)) {
    throw new HireError('Connect a real wallet before hiring an agent.');
  }
  if (!taskSpec?.trim()) {
    throw new HireError('Task specification is required.');
  }

  // Env says contracts are live, but write path is not implemented yet.
  if (isContractsDeployed()) {
    throw new HireError(
      'Contract addresses are configured, but on-chain escrow writes are not implemented yet. Unset NEXT_PUBLIC_ERC8183_CONTRACT_ADDRESS until the deposit flow is wired, or complete the write+receipt path first.'
    );
  }

  const localJobId = `fc-job-${Date.now().toString(36)}`;
  const now = new Date();
  const expiredAt = new Date(now.getTime() + durationHours * 3600 * 1000);

  const hasRealDeposit = Boolean(escrowDepositTx && /^0x[a-fA-F0-9]{64}$/.test(escrowDepositTx));

  const job: HireJob = {
    id: localJobId,
    agentId: agent.id,
    agentName: agent.name,
    category: agent.category,
    clientAddress,
    providerAddress: agent.providerAddress,
    evaluatorAddress: CONTRACT_ADDRESSES.evaluator,
    budgetBnb,
    status: hasRealDeposit ? 'funded' : 'intent',
    taskSpec,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiredAt: expiredAt.toISOString(),
    sessionKeyId,
    isSimulated: isSimulated || !hasRealDeposit,
    txHashes: hasRealDeposit && escrowDepositTx ? { escrowDepositTx } : {},
  };

  saveJob(job);
  return job;
}

export async function submitAgentProof(
  jobId: string,
  _resultUri: string,
  executionTxHash?: string
): Promise<HireJob | null> {
  const { updateJob } = await import('./storage');
  if (isContractsDeployed() && !executionTxHash) {
    throw new HireError('On-chain mode requires a real execution transaction hash.');
  }
  if (executionTxHash && !/^0x[a-fA-F0-9]{64}$/.test(executionTxHash)) {
    throw new HireError('Invalid execution transaction hash.');
  }
  return updateJob(jobId, {
    status: executionTxHash ? 'submitted' : 'intent',
    txHashes: executionTxHash ? { agentExecutionTx: executionTxHash } : {},
    isSimulated: !executionTxHash,
  });
}
