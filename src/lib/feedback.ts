import type { FeedbackItem } from '../types';

function parsePoints(points: string): { earned: number; total: number } | null {
  const match = points.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return { earned: parseFloat(match[1]), total: parseFloat(match[2]) };
}

function hasExplicitDeduction(deduction: string | undefined): boolean {
  const d = deduction?.trim().toLowerCase();
  if (!d) return false;
  return d !== 'none.' && d !== 'none' && d !== '0' && d !== 'n/a' && d !== '-';
}

/** True when the student lost any points on this question. */
export function hasPointDeduction(item: FeedbackItem): boolean {
  const parsed = parsePoints(item.points);
  if (parsed && parsed.earned < parsed.total) return true;
  return hasExplicitDeduction(item.deduction);
}

export function filterDeductionFeedback(feedback: FeedbackItem[]): FeedbackItem[] {
  return feedback.filter(hasPointDeduction);
}
