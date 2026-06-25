const UNLOCK_PREFIX = 'workshop-unlocked:';
const VARS_KEY = 'workshop-vars';

export function unlockKey(slug: string): string {
  return `${UNLOCK_PREFIX}${slug}`;
}

export function isUnlocked(slug: string): boolean {
  try {
    return sessionStorage.getItem(unlockKey(slug)) === 'true';
  } catch {
    return false;
  }
}

export function setUnlocked(slug: string): void {
  try {
    sessionStorage.setItem(unlockKey(slug), 'true');
  } catch {
    // sessionStorage unavailable
  }
}

export function getStoredVars(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(VARS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveStoredVars(vars: Record<string, string>): void {
  try {
    sessionStorage.setItem(VARS_KEY, JSON.stringify(vars));
  } catch {
    // sessionStorage unavailable
  }
}
