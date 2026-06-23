import type { GradingType } from '../types';

export interface GradingTypeOption {
  value: GradingType;
  label: string;
  description: string;
}

export const GRADING_TYPE_OPTIONS: GradingTypeOption[] = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Grade strictly from your answer key and custom rubric.',
  },
  {
    value: 'moe_english_reading',
    label: 'MoE English — Reading & short answers',
    description:
      'Bagrut-style comprehension: factual answers, inference, evidence, vocabulary-in-context (Modules C–G).',
  },
  {
    value: 'moe_english_writing',
    label: 'MoE English — Writing / composition',
    description:
      'Essays and extended writing: content (W1), structure (W2), vocabulary (W3), register (W4), accuracy (W5).',
  },
  {
    value: 'moe_english_vocabulary',
    label: 'MoE English — Vocabulary (Module E)',
    description:
      'Word knowledge, definitions, synonyms, and usage — precise meaning required.',
  },
  {
    value: 'moe_english_mixed',
    label: 'MoE English — Full Bagrut paper',
    description:
      'Mixed exam: apply reading rules to comprehension sections and writing rules to composition sections.',
  },
];

export const DEFAULT_GRADING_TYPE: GradingType = 'standard';

export function getGradingTypeLabel(value: GradingType | string | undefined): string {
  const option = GRADING_TYPE_OPTIONS.find((o) => o.value === value);
  return option?.label ?? 'Standard';
}

export function normalizeGradingType(value: string | undefined | null): GradingType {
  if (GRADING_TYPE_OPTIONS.some((o) => o.value === value)) {
    return value as GradingType;
  }
  return DEFAULT_GRADING_TYPE;
}
