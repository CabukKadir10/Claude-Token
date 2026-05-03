import type { ModelTier } from '@/domain/value-objects/model-tier';

/**
 * Stable color per model tier, used by the donut chart, KPI accents, and the
 * model breakdown table swatches. Hue is keyed to the family (Opus = warm,
 * Sonnet = blue, Haiku = green) so users can recognise families at a glance,
 * with lightness/chroma stepping down for older versions within a family.
 *
 * OKLCH plays well with both light and dark themes.
 */
export const MODEL_TIER_COLOR: Readonly<Record<ModelTier, string>> = Object.freeze({
  'opus-4-7':   'oklch(64% 0.20 30)',
  'opus-4-6':   'oklch(60% 0.19 25)',
  'opus-4-5':   'oklch(58% 0.17 22)',
  'opus-4-1':   'oklch(56% 0.15 18)',
  'opus-4':     'oklch(54% 0.13 15)',
  'opus-3':     'oklch(52% 0.10 10)',
  'sonnet-4-6': 'oklch(62% 0.18 255)',
  'sonnet-4-5': 'oklch(60% 0.16 250)',
  'sonnet-4':   'oklch(58% 0.14 245)',
  'sonnet-3-7': 'oklch(54% 0.12 240)',
  'haiku-4-5':  'oklch(70% 0.16 155)',
  'haiku-3-5':  'oklch(66% 0.14 150)',
  'haiku-3':    'oklch(62% 0.12 145)',
  default:      'oklch(60% 0.04 255)',
});

export function colorForTier(tier: ModelTier): string {
  return MODEL_TIER_COLOR[tier];
}
