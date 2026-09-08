import { HireJob, AltanaSession } from './types';

/**
 * Persistence policy:
 * - Compare list → localStorage (non-sensitive UI)
 * - Jobs / sessions → sessionStorage only (no seed fake proofs)
 * - Never store private keys or signing material
 */

const JOBS_KEY = 'fourcorners_jobs_v2';
const SESSION_KEY = 'fourcorners_session_v2';
const COMPARE_KEY = 'fourcorners_compare_ids_v1';

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined';
}

export function getStoredJobs(): HireJob[] {
  if (!canUseBrowserStorage()) return [];
  try {
    const raw = sessionStorage.getItem(JOBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HireJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveJob(job: HireJob): void {
  if (!canUseBrowserStorage()) return;
  try {
    const current = getStoredJobs();
    const idx = current.findIndex((j) => j.id === job.id);
    if (idx >= 0) current[idx] = job;
    else current.unshift(job);
    sessionStorage.setItem(JOBS_KEY, JSON.stringify(current.slice(0, 25)));
    window.dispatchEvent(new CustomEvent('fourcorners_jobs_changed'));
  } catch (e) {
    console.error('Failed to save job intent', e);
  }
}

export function updateJob(
  jobId: string,
  updates: Partial<HireJob>
): HireJob | null {
  if (!canUseBrowserStorage()) return null;
  try {
    const current = getStoredJobs();
    const index = current.findIndex((j) => j.id === jobId);
    if (index === -1) return null;
    const updatedJob: HireJob = {
      ...current[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      txHashes: {
        ...current[index].txHashes,
        ...(updates.txHashes || {}),
      },
    };
    current[index] = updatedJob;
    sessionStorage.setItem(JOBS_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('fourcorners_jobs_changed'));
    return updatedJob;
  } catch (e) {
    console.error('Failed to update job', e);
    return null;
  }
}

export function getStoredSession(): AltanaSession | null {
  if (!canUseBrowserStorage()) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AltanaSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AltanaSession): void {
  if (!canUseBrowserStorage()) return;
  try {
    const safe: AltanaSession = {
      sessionKeyId: session.sessionKeyId,
      publicKey: session.publicKey || '',
      ownerAddress: session.ownerAddress,
      spendCapBnb: session.spendCapBnb,
      spentBnb: session.spentBnb,
      expiryTimestamp: session.expiryTimestamp,
      allowedContracts: session.allowedContracts,
      status: session.status,
      txHash: session.txHash || '',
      keystoreRegistered: Boolean(session.keystoreRegistered),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent('fourcorners_session_changed'));
  } catch (e) {
    console.error('Failed to save session metadata', e);
  }
}

export function revokeStoredSession(revokeTxHash?: string): void {
  if (!canUseBrowserStorage()) return;
  try {
    const session = getStoredSession();
    if (session) {
      session.status = 'revoked';
      if (revokeTxHash) session.txHash = revokeTxHash;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('fourcorners_session_changed'));
    }
  } catch (e) {
    console.error('Failed to revoke session metadata', e);
  }
}

export function clearSession(): void {
  if (!canUseBrowserStorage()) return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('fourcorners_session_changed'));
  } catch {
    /* ignore */
  }
}

export function getCompareIds(): string[] {
  if (!canUseBrowserStorage()) return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleCompareId(agentId: string): string[] {
  if (!canUseBrowserStorage()) return [];
  try {
    let ids = getCompareIds();
    if (ids.includes(agentId)) ids = ids.filter((id) => id !== agentId);
    else {
      if (ids.length >= 3) ids.shift();
      ids.push(agentId);
    }
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
    window.dispatchEvent(
      new CustomEvent('fourcorners_compare_changed', { detail: ids })
    );
    return ids;
  } catch {
    return [];
  }
}

export function clearCompareIds(): void {
  if (!canUseBrowserStorage()) return;
  try {
    localStorage.removeItem(COMPARE_KEY);
    window.dispatchEvent(
      new CustomEvent('fourcorners_compare_changed', { detail: [] })
    );
  } catch (e) {
    console.error('Failed to clear compare ids', e);
  }
}
