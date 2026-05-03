/**
 * Pricing-equivalent model groups. Every model name is mapped to one of these
 * tiers so the Pricing table only needs ~14 rows instead of one row per model.
 *
 * Order is meaningful for UI display (most recent first within a family).
 */
export const MODEL_TIERS = [
  'opus-4-7',
  'opus-4-6',
  'opus-4-5',
  'opus-4-1',
  'opus-4',
  'opus-3',
  'sonnet-4-6',
  'sonnet-4-5',
  'sonnet-4',
  'sonnet-3-7',
  'haiku-4-5',
  'haiku-3-5',
  'haiku-3',
  'default',
] as const;

export type ModelTier = (typeof MODEL_TIERS)[number];

export const MODEL_FAMILIES = ['opus', 'sonnet', 'haiku'] as const;
export type ModelFamily = (typeof MODEL_FAMILIES)[number];

export function familyOf(tier: ModelTier): ModelFamily | 'unknown' {
  if (tier.startsWith('opus')) return 'opus';
  if (tier.startsWith('sonnet')) return 'sonnet';
  if (tier.startsWith('haiku')) return 'haiku';
  return 'unknown';
}
