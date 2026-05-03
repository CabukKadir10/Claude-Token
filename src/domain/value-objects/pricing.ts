import type { ModelTier } from './model-tier';

/**
 * Pricing for one model tier. All values are USD per 1M tokens.
 * Source: anthropic.com/pricing official list.
 */
export interface PricingRow {
  /** Base input tokens. */
  readonly in: number;
  /** Output tokens. */
  readonly out: number;
  /** Cache hits & refreshes (cache read). */
  readonly cr: number;
  /** 5-minute ephemeral cache writes. */
  readonly cw5m: number;
  /** 1-hour ephemeral cache writes. */
  readonly cw1h: number;
  /** Display label (English; UI translates as needed). */
  readonly label: string;
}

export type Pricing = Readonly<Record<ModelTier, PricingRow>>;

/**
 * Default Anthropic list pricing (snapshot 2026-04). User can override and
 * the override is persisted to localStorage by the infrastructure layer.
 */
export const DEFAULT_PRICING: Pricing = Object.freeze({
  'opus-4-7':   { in: 5,    out: 25,   cr: 0.5,  cw5m: 6.25,  cw1h: 10,   label: 'Claude Opus 4.7' },
  'opus-4-6':   { in: 5,    out: 25,   cr: 0.5,  cw5m: 6.25,  cw1h: 10,   label: 'Claude Opus 4.6' },
  'opus-4-5':   { in: 5,    out: 25,   cr: 0.5,  cw5m: 6.25,  cw1h: 10,   label: 'Claude Opus 4.5' },
  'opus-4-1':   { in: 15,   out: 75,   cr: 1.5,  cw5m: 18.75, cw1h: 30,   label: 'Claude Opus 4.1' },
  'opus-4':     { in: 15,   out: 75,   cr: 1.5,  cw5m: 18.75, cw1h: 30,   label: 'Claude Opus 4' },
  'opus-3':     { in: 15,   out: 75,   cr: 1.5,  cw5m: 18.75, cw1h: 30,   label: 'Claude Opus 3 (deprecated)' },
  'sonnet-4-6': { in: 3,    out: 15,   cr: 0.3,  cw5m: 3.75,  cw1h: 6,    label: 'Claude Sonnet 4.6' },
  'sonnet-4-5': { in: 3,    out: 15,   cr: 0.3,  cw5m: 3.75,  cw1h: 6,    label: 'Claude Sonnet 4.5' },
  'sonnet-4':   { in: 3,    out: 15,   cr: 0.3,  cw5m: 3.75,  cw1h: 6,    label: 'Claude Sonnet 4' },
  'sonnet-3-7': { in: 3,    out: 15,   cr: 0.3,  cw5m: 3.75,  cw1h: 6,    label: 'Claude Sonnet 3.7 (deprecated)' },
  'haiku-4-5':  { in: 1,    out: 5,    cr: 0.1,  cw5m: 1.25,  cw1h: 2,    label: 'Claude Haiku 4.5' },
  'haiku-3-5':  { in: 0.8,  out: 4,    cr: 0.08, cw5m: 1,     cw1h: 1.6,  label: 'Claude Haiku 3.5' },
  'haiku-3':    { in: 0.25, out: 1.25, cr: 0.03, cw5m: 0.3,   cw1h: 0.5,  label: 'Claude Haiku 3' },
  default:      { in: 3,    out: 15,   cr: 0.3,  cw5m: 3.75,  cw1h: 6,    label: 'Default (unknown model)' },
});

/** Returns a fresh, mutable deep copy of the default pricing table. */
export function clonePricing(p: Pricing = DEFAULT_PRICING): Pricing {
  const out = {} as Record<ModelTier, PricingRow>;
  for (const tier of Object.keys(p) as ModelTier[]) {
    out[tier] = { ...p[tier] };
  }
  return out;
}
