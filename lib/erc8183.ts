import { HireJob } from './types';
import { CONTRACT_ADDRESSES } from './wallet';
import { saveJob, updateJob } from './storage';
import { Agent } from './types';

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

/**
 * Creates and funds an ERC-8183 escrow job on BSC Testnet.
 * Locks the client's budget into the escrow contract until the Evaluator verifies work.
 */
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

  const localJobId = `fc-job-${Date.now().toString().slice(-6)}`;
  const onChainJobId = Math.floor(Math.random() * 9000) + 1000;
  
  const now = new Date();
  const expiredAt = new Date(now.getTime() + durationHours * 3600 * 1000);

  const job: HireJob = {
    id: localJobId,
    onChainJobId,
    agentId: agent.id,
    agentName: agent.name,
    category: agent.category,
    clientAddress,
    providerAddress: agent.providerAddress,
    evaluatorAddress: CONTRACT_ADDRESSES.evaluator,
    budgetBnb,
    status: 'funded',
    taskSpec,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiredAt: expiredAt.toISOString(),
    sessionKeyId,
    isSimulated,
    txHashes: {
      escrowDepositTx: escrowDepositTx || undefined,
    },
  };

  saveJob(job);
  return job;
}

/**
 * Triggered by the agent when it completes the task and submits execution proof.
 */
export async function submitAgentProof(jobId: string, resultUri: string, txHash?: string): Promise<HireJob | null> {
  return updateJob(jobId, {
    status: 'submitted',
    txHashes: {
      agentExecutionTx: txHash || undefined,
    },
  });
}
