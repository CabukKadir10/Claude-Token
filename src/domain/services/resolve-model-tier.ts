import type { ModelTier } from '../value-objects/model-tier';

/**
 * Map any Claude model name (old or new naming style) to a pricing tier.
 *
 * Order is important: more specific patterns are checked before generic
 * fallbacks. The function is deliberately tolerant — when nothing matches it
 * still returns the family's latest tier so cost estimates degrade gracefully.
 *
 * Examples:
 *   `claude-opus-4-7-20251219`     → 'opus-4-7'
 *   `claude-3-5-sonnet-20241022`   → 'sonnet-3-7' (same price tier)
 *   `claude-haiku`                 → 'haiku-4-5' (latest of family)
 *   `gpt-4`                        → 'default'
 *   null / undefined / ''          → 'default'
 */
export function resolveModelTier(model: string | null | undefined): ModelTier {
  if (!model) return 'default';
  const m = model.toLowerCase().replace(/\./g, '-');

  // Opus — current naming
  if (m.includes('opus-4-7')) return 'opus-4-7';
  if (m.includes('opus-4-6')) return 'opus-4-6';
  if (m.includes('opus-4-5')) return 'opus-4-5';
  if (m.includes('opus-4-1')) return 'opus-4-1';

  // Sonnet — current naming
  if (m.includes('sonnet-4-6')) return 'sonnet-4-6';
  if (m.includes('sonnet-4-5')) return 'sonnet-4-5';
  if (m.includes('sonnet-3-7') || m.includes('3-7-sonnet')) return 'sonnet-3-7';

  // Haiku — current naming
  if (m.includes('haiku-4-5')) return 'haiku-4-5';
  if (m.includes('haiku-3-5') || m.includes('3-5-haiku')) return 'haiku-3-5';

  // Legacy `claude-3-*` naming
  if (m.includes('3-5-sonnet') || m.includes('sonnet-3-5')) return 'sonnet-3-7'; // same price tier
  if (m.includes('opus-3') || m.includes('3-opus')) return 'opus-3';
  if (m.includes('haiku-3') || m.includes('3-haiku')) return 'haiku-3';

  // Generic 4.x fallbacks (no minor version present)
  if (m.includes('opus-4')) return 'opus-4';
  if (m.includes('sonnet-4')) return 'sonnet-4';

  // Very generic — pick latest of family
  if (m.includes('opus')) return 'opus-4-7';
  if (m.includes('sonnet')) return 'sonnet-4-6';
  if (m.includes('haiku')) return 'haiku-4-5';

  return 'default';
}
