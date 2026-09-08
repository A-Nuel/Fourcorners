import { HireJob, AltanaSession } from './types';

const JOBS_STORAGE_KEY = 'fourcorners_hire_jobs_v2';
const SESSION_STORAGE_KEY = 'fourcorners_altana_session_v2';
const COMPARE_STORAGE_KEY = 'fourcorners_compare_ids_v2';

const SEED_JOBS: HireJob[] = [];

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
