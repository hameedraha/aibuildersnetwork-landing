import { getStoredVars, saveStoredVars } from './unlock';

const VAR_PATTERN = /\$([A-Z][A-Z0-9_]*)/g;

export function extractVariables(content: string): string[] {
  const matches = content.matchAll(VAR_PATTERN);
  const seen = new Set<string>();
  for (const match of matches) {
    seen.add(match[1]);
  }
  return Array.from(seen);
}

export function substituteVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(VAR_PATTERN, (_, key: string) => values[key] ?? `$${key}`);
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export interface VariableMeta {
  key: string;
  label: string;
  placeholder: string;
}

export function resolveVariableMeta(
  keys: string[],
  configVars: VariableMeta[]
): VariableMeta[] {
  const configMap = new Map(configVars.map((v) => [v.key, v]));
  return keys.map((key) => {
    const found = configMap.get(key);
    return found ?? { key, label: key.toLowerCase(), placeholder: '' };
  });
}

export function getPrefilledValues(keys: string[]): Record<string, string> {
  const stored = getStoredVars();
  const result: Record<string, string> = {};
  for (const key of keys) {
    if (key in stored) result[key] = stored[key];
  }
  return result;
}

export function persistVariableValues(values: Record<string, string>): void {
  const stored = getStoredVars();
  saveStoredVars({ ...stored, ...values });
}

export function initCopyPrompts(
  configVars: VariableMeta[],
  onOpenModal: (payload: {
    content: string;
    variables: VariableMeta[];
    prefilled: Record<string, string>;
    trigger: HTMLButtonElement;
  }) => void
): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-prompt]').forEach((btn) => {
    if (btn.dataset.copyInit === 'true') return;
    btn.dataset.copyInit = 'true';

    btn.addEventListener('click', async () => {
      const content = btn.dataset.promptContent ?? '';
      const keys = extractVariables(content);

      if (keys.length === 0) {
        try {
          await copyToClipboard(content);
        } catch {
          // clipboard may be blocked
        }
        showCopiedFeedback(btn);
        return;
      }

      const variables = resolveVariableMeta(keys, configVars);
      const prefilled = getPrefilledValues(keys);
      onOpenModal({ content, variables, prefilled, trigger: btn });
    });
  });
}

export function showCopiedFeedback(btn: HTMLButtonElement): void {
  const original = btn.textContent;
  btn.textContent = 'copied';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1500);
}
