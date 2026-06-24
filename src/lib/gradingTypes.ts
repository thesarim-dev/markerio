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
    value: 'moe_english_module_c',
    label: 'MoE English — Module C (4 Points)',
    description:
      '3–4 unit reading comprehension: factual answers, inference, and vocabulary-in-context.',
  },
  {
    value: 'moe_english_module_e',
    label: 'MoE English — Module E (4/5 Points Overlap)',
    description:
      'Vocabulary module: definitions, synonyms, antonyms, and precise word usage.',
  },
  {
    value: 'moe_english_module_g',
    label: 'MoE English — Module G (5 Points)',
    description:
      '5-unit Bagrut: literature reading (~60%) plus writing/composition (~40%) with W1–W5 criteria.',
  },
];

export const DEFAULT_GRADING_TYPE: GradingType = 'standard';

const LEGACY_GRADING_TYPE_MAP: Record<string, GradingType> = {
  moe_english_reading: 'moe_english_module_c',
  moe_english_vocabulary: 'moe_english_module_e',
  moe_english_writing: 'moe_english_module_g',
  moe_english_mixed: 'moe_english_module_g',
};

export function getGradingTypeLabel(value: GradingType | string | undefined): string {
  const normalized = normalizeGradingType(value);
  const option = GRADING_TYPE_OPTIONS.find((o) => o.value === normalized);
  return option?.label ?? 'Standard';
}

export function normalizeGradingType(value: string | undefined | null): GradingType {
  if (!value) return DEFAULT_GRADING_TYPE;
  if (GRADING_TYPE_OPTIONS.some((o) => o.value === value)) {
    return value as GradingType;
  }
  return LEGACY_GRADING_TYPE_MAP[value] ?? DEFAULT_GRADING_TYPE;
}
