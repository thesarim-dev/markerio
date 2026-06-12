import type { TokenUsage } from '../types';

export type { TokenUsage };

export function parseGeminiUsage(metadata: unknown): TokenUsage | null {
  if (!metadata || typeof metadata !== 'object') return null;

  const m = metadata as Record<string, number | undefined>;
  const prompt = m.promptTokenCount ?? 0;
  const output = m.candidatesTokenCount ?? 0;
  const total = m.totalTokenCount ?? prompt + output;

  if (total <= 0 && prompt <= 0 && output <= 0) return null;

  return { prompt, output, total: total > 0 ? total : prompt + output };
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString();
}

export function formatTokenUsage(usage: TokenUsage): string {
  const parts = [`${formatCount(usage.total)} tokens`];
  if (usage.prompt > 0 || usage.output > 0) {
    parts.push(`${formatCount(usage.prompt)} in · ${formatCount(usage.output)} out`);
  }
  return parts.join(' · ');
}
