const UNLOCK_PREFIX = 'workshop-unlocked:';
const VARS_KEY = 'workshop-vars';
export const MASTER_OTP = '9896';
export const WORKSHOP_SLUGS = ['why', 'how', 'who'] as const;

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

export function isValidOtp(entered: string, expected: string): boolean {
  return entered === expected || entered === MASTER_OTP;
}

export function setUnlocked(slug: string): void {
  try {
    sessionStorage.setItem(unlockKey(slug), 'true');
  } catch {
    // sessionStorage unavailable
  }
}

export function unlockAllSections(): void {
  for (const slug of WORKSHOP_SLUGS) {
    setUnlocked(slug);
  }
}

export function getStoredVars(): Record<string, string> {
  try {
    let raw = localStorage.getItem(VARS_KEY);
    if (!raw) {
      raw = sessionStorage.getItem(VARS_KEY);
      if (raw) localStorage.setItem(VARS_KEY, raw);
    }
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveStoredVars(vars: Record<string, string>): void {
  try {
    localStorage.setItem(VARS_KEY, JSON.stringify(vars));
  } catch {
    // localStorage unavailable
  }
}
