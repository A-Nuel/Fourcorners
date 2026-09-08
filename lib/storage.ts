import { HireJob, AltanaSession } from './types';

const JOBS_STORAGE_KEY = 'fourcorners_hire_jobs_v1';
const SESSION_STORAGE_KEY = 'fourcorners_altana_session_v1';
const COMPARE_STORAGE_KEY = 'fourcorners_compare_ids_v1';

const SEED_JOBS: HireJob[] = [
  {
    id: 'fc-job-184',
    onChainJobId: 184,
    agentId: 'liquidationwatch',
    agentName: 'LiquidationWatch',
    category: 'health-factor',
    clientAddress: '0x32759604104c810E3B68565b939E8b64e0303E8A',
    providerAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    evaluatorAddress: '0xE9a1000000000000000000000000000000000097',
    budgetBnb: '0.02',
    status: 'completed',
    taskSpec: 'Guard Venus loan. Warning HF: 1.30, Emergency HF: 1.15. Repay 0.05 tBNB if breached.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    expiredAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    sessionKeyId: 'altana-sess-97-0x9812a4',
    txHashes: {
      sessionTx: '0x14a938c92ff8129a7381273918aef82719283719283719823719827391827391',
      escrowDepositTx: '0x2bf9830219cba829102837192837192837192837192837198237198273918273',
      agentExecutionTx: '0x3cf8912738917298371928371928371928371928371982371982739182739182',
      evaluatorVerifyTx: '0x4df7829102837192837192837192837192837192837198237198273918273918',
    },
    proof: {
      proofHash: '0x7e8b91a283719283719283719283719283719283719823719827391827391827',
      txHash: '0x3cf8912738917298371928371928371928371928371982371982739182739182',
      blockNumber: 42109841,
      evaluatedAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
      stateDiff: {
        metric: 'Venus Health Factor',
        before: '1.14 (Critical Danger)',
        after: '1.38 (Safe Restored)',
      },
      evaluatorAddress: '0xE9a1000000000000000000000000000000000097',
      passed: true,
      details: 'Evaluator verified debt repayment of 0.05 tBNB via Venus repayBorrowBehalf(). Health Factor successfully restored to 1.38. Escrow funds released to agent.',
    },
  },
  {
    id: 'fc-job-185',
    onChainJobId: 185,
    agentId: 'rangeguard',
    agentName: 'RangeGuard',
    category: 'rebalancing',
    clientAddress: '0x32759604104c810E3B68565b939E8b64e0303E8A',
    providerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    evaluatorAddress: '0xE9a1000000000000000000000000000000000097',
    budgetBnb: '0.02',
    status: 'completed',
    taskSpec: 'Monitor PancakeSwap v3 BNB/USDT pool. Rebalance tick range if price drifts ±3.5%.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5.9).toISOString(),
    expiredAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    sessionKeyId: 'altana-sess-97-0x9812a4',
    txHashes: {
      sessionTx: '0x14a938c92ff8129a7381273918aef82719283719283719823719827391827391',
      escrowDepositTx: '0x5ef6781928371928371928371928371928371928371982371982739182739182',
      agentExecutionTx: '0x6fa5672918237192837192837192837192837192837198237198273918273918',
      evaluatorVerifyTx: '0x7ab4561028371928371928371928371928371928371982371982739182739182',
    },
    proof: {
      proofHash: '0x8f9c102938471928371928371928371928371928371982371982739182739182',
      txHash: '0x6fa5672918237192837192837192837192837192837198237198273918273918',
      blockNumber: 42105120,
      evaluatedAt: new Date(Date.now() - 3600000 * 5.9).toISOString(),
      stateDiff: {
        metric: 'Concentrated LP Range',
        before: 'Tick [12400, 13100] (Out of Range)',
        after: 'Tick [12850, 13550] (Centered Active)',
      },
      evaluatorAddress: '0xE9a1000000000000000000000000000000000097',
      passed: true,
      details: 'Evaluator verified PancakeSwap v3 position NFT #88412 minted with new bounds centered at spot tick 13200. Fee capture restored at +14.2% APY.',
    },
  },
];

export function getStoredJobs(): HireJob[] {
  if (typeof window === 'undefined') return SEED_JOBS;
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(SEED_JOBS));
      return SEED_JOBS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_JOBS;
  }
}

export function saveJob(job: HireJob): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredJobs();
    const updated = [job, ...current.filter((j) => j.id !== job.id)];
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save job to storage', e);
  }
}

export function updateJob(jobId: string, updates: Partial<HireJob>): HireJob | null {
  if (typeof window === 'undefined') return null;
  try {
    const current = getStoredJobs();
    const index = current.findIndex((j) => j.id === jobId);
    if (index === -1) return null;
    const updatedJob = { ...current[index], ...updates, updatedAt: new Date().toISOString() };
    current[index] = updatedJob;
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(current));
    return updatedJob;
  } catch (e) {
    console.error('Failed to update job', e);
    return null;
  }
}

export function getStoredSession(): AltanaSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: AltanaSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export function revokeStoredSession(revokeTxHash: string): void {
  if (typeof window === 'undefined') return;
  try {
    const session = getStoredSession();
    if (session) {
      session.status = 'revoked';
      session.txHash = revokeTxHash;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Failed to revoke session in storage', e);
  }
}

export function getCompareIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleCompareId(agentId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    let ids = getCompareIds();
    if (ids.includes(agentId)) {
      ids = ids.filter((id) => id !== agentId);
    } else {
      if (ids.length >= 3) {
        // max 3
        ids.shift();
      }
      ids.push(agentId);
    }
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('fourcorners_compare_changed', { detail: ids }));
    return ids;
  } catch {
    return [];
  }
}

export function clearCompareIds(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(COMPARE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('fourcorners_compare_changed', { detail: [] }));
  } catch (e) {
    console.error('Failed to clear compare ids', e);
  }
}
