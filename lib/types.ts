export type Category =
  | 'rebalancing'
  | 'grid-trading'
  | 'yield-optimisation'
  | 'health-factor';

export interface CategoryInfo {
  slug: Category;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
}

export type SellerTier = 'Top Rated Agent' | 'Level 2 Agent' | 'Rising Star';
export type RiskLevel = 'Low' | 'Medium' | 'High-Stakes Security';

export interface AgentInputParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  default: string | number | boolean;
}

export interface GigPackage {
  id: 'basic' | 'pro' | 'enterprise';
  name: string;
  priceBnb: string;
  priceUsd: string;
  turnaroundTime: string;
  deliverables: string[];
}

export interface Agent {
  id: string;
  name: string;
  category: Category;
  shortDescription: string;
  longDescription: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  sellerTier: SellerTier;
  riskLevel: RiskLevel;
  status: 'live' | 'degraded' | 'unknown';
  network: 'bsc-testnet' | 'bsc-mainnet';
  hirePriceHint: string;
  minBudget: string;
  providerAddress: `0x${string}`;
  erc8004Id: string;
  endpoint: string;
  deliveryTime: string;
  supportedProtocols: string[];
  capabilities: string[];
  sampleTask: string;
  metrics: {
    jobsCompleted: number;
    lastActiveAt: string;
    note: string;
    performanceSignal?: string;
  };
  inputParameters: AgentInputParameter[];
  requiredPermissions: {
    targetContracts: string[];
    allowedFunctions: string[];
    spendCeilingHint: string;
  };
  evaluatorVerificationCheck: string;
  packages: GigPackage[];
}

/** intent = local pre-deploy record; not escrowed on-chain */
export type JobStatus =
  | 'intent'
  | 'open'
  | 'funded'
  | 'submitted'
  | 'completed'
  | 'refunded';

export interface VerificationProof {
  proofHash: string;
  txHash: string;
  blockNumber?: number;
  evaluatedAt: string;
  stateDiff: {
    metric: string;
    before: string;
    after: string;
  };
  evaluatorAddress: string;
  passed: boolean;
  details: string;
  /** true when not backed by a real chain receipt */
  isSimulated?: boolean;
  onChain?: boolean;
}

export interface HireJob {
  id: string;
  onChainJobId?: number;
  agentId: string;
  agentName: string;
  category: Category;
  clientAddress: string;
  providerAddress: string;
  evaluatorAddress: string;
  budgetBnb: string;
  status: JobStatus;
  taskSpec: string;
  createdAt: string;
  updatedAt: string;
  expiredAt: string;
  sessionKeyId?: string;
  isSimulated?: boolean;
  txHashes: {
    sessionTx?: string;
    escrowDepositTx?: string;
    agentExecutionTx?: string;
    evaluatorVerifyTx?: string;
    revokeTx?: string;
  };
  proof?: VerificationProof;
}

export interface AltanaSession {
  sessionKeyId: string;
  publicKey: string;
  ownerAddress: string;
  spendCapBnb: string;
  spentBnb: string;
  expiryTimestamp: number;
  allowedContracts: string[];
  status: 'active' | 'revoked' | 'expired' | 'intent';
  txHash: string;
  keystoreRegistered: boolean;
}
