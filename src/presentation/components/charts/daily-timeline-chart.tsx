'use client';

import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import type { DailyBucket } from '@/domain/entities/daily-bucket';
import { totalTokens } from '@/domain/value-objects/tokens';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { fillDailyGaps } from '@/application/services/fill-daily-gaps';
import { fmtCost, fmtCostCompact } from '@/shared/utils/format-cost';
import { fmtCompact, fmtFull } from '@/shared/utils/format-number';
import { useLocale } from '@/presentation/components/layout/locale-provider';
import { cn } from '@/shared/utils/cn';

export type DailyTimelineMode = 'total' | 'cost' | 'split';

interface DailyTimelineChartProps {
  readonly daily: ReadonlyArray<DailyBucket>;
}

const VIEWBOX_W = 720;
const VIEWBOX_H = 240;
const PAD = { l: 56, r: 16, t: 16, b: 28 } as const;

const TOKEN_KEYS = ['input', 'output', 'cacheRead', 'cacheWrite'] as const;
type TokenSeriesKey = (typeof TOKEN_KEYS)[number];

const SERIES_COLORS: Record<TokenSeriesKey | 'total' | 'cost', string> = {
  input: 'var(--color-token-input)',
  output: 'var(--color-token-output)',
  cacheRead: 'var(--color-token-cache-read)',
  cacheWrite: 'var(--color-token-cache-write)',
  total: 'var(--color-token-total)',
  cost: 'var(--color-cost)',
};

/**
 * Daily activity card with three modes:
 *   - total: tokens summed per day
 *   - cost:  $ per day
 *   - split: input / output / cache-r / cache-w side-by-side
 *
 * The chart is pure SVG (no external library), gap-filled so that runs of
 * inactive days render as a flat line rather than a misleading slope. A
 * single mousemove handler drives the hover index across the whole plot
 * area, with an HTML overlay tooltip layered on top.
 */
export function DailyTimelineChart({ daily }: DailyTimelineChartProps) {
  const t = useTranslations('timeline.daily');
  const { locale } = useLocale();
  const [mode, setMode] = useState<DailyTimelineMode>('total');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const filled = useMemo(() => fillDailyGaps(daily), [daily]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <ModeSwitcher mode={mode} setMode={setMode} t={(k) => t(`mode.${k}`)} />
      </CardHeader>
      <CardContent className="pt-1">
        {filled.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ChartBody
            data={filled}
            mode={mode}
            locale={locale}
            hoverIdx={hoverIdx}
            setHoverIdx={setHoverIdx}
            t={t}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ModeSwitcher({
  mode,
  setMode,
  t,
}: {
  mode: DailyTimelineMode;
  setMode: (m: DailyTimelineMode) => void;
  t: (key: string) => string;
}) {
  const items: ReadonlyArray<DailyTimelineMode> = ['total', 'cost', 'split'];
  return (
    <div className="flex items-center gap-0.5">
      {items.map((m) => (
        <Button
          key={m}
          variant={mode === m ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode(m)}
        >
          {t(m)}
        </Button>
      ))}
    </div>
  );
}

interface ChartBodyProps {
  readonly data: ReadonlyArray<DailyBucket>;
  readonly mode: DailyTimelineMode;
  readonly locale: string;
  readonly hoverIdx: number | null;
  readonly setHoverIdx: (i: number | null) => void;
  readonly t: (key: string) => string;
}

function ChartBody({ data, mode, locale, hoverIdx, setHoverIdx, t }: ChartBodyProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const innerW = VIEWBOX_W - PAD.l - PAD.r;
  const innerH = VIEWBOX_H - PAD.t - PAD.b;

  const xFor = (i: number) =>
    data.length === 1 ? PAD.l + innerW / 2 : PAD.l + (i / (data.length - 1)) * innerW;

  const { max, fmtY } = useMemo(() => {
    if (mode === 'cost') {
      const m = Math.max(0.0001, ...data.map((d) => d.cost));
      return { max: m, fmtY: (v: number) => fmtCostCompact(v) };
    }
    if (mode === 'split') {
      const m = Math.max(
        1,
        ...data.flatMap((d) => [
          d.tokens.input,
          d.tokens.output,
          d.tokens.cacheRead,
          d.tokens.cacheWrite + d.tokens.cacheWrite1h,
        ]),
      );
      return { max: m, fmtY: fmtCompact };
    }
    const m = Math.max(1, ...data.map((d) => totalTokens(d.tokens)));
    return { max: m, fmtY: fmtCompact };
  }, [data, mode]);

  const yFor = (v: number) => PAD.t + innerH - (v / max) * innerH;

  const gridY = Array.from({ length: 5 }, (_, i) => PAD.t + (innerH / 4) * i);
  const xTickCount = Math.min(data.length, 7);
  const xTicks = Array.from({ length: xTickCount }, (_, i) =>
    Math.round((i / Math.max(xTickCount - 1, 1)) * (data.length - 1)),
  );

  const valuesFor = (key: 'total' | 'cost' | TokenSeriesKey): ReadonlyArray<number> => {
    if (key === 'total') return data.map((d) => totalTokens(d.tokens));
    if (key === 'cost') return data.map((d) => d.cost);
    if (key === 'cacheWrite') {
      return data.map((d) => d.tokens.cacheWrite + d.tokens.cacheWrite1h);
    }
    return data.map((d) => d.tokens[key]);
  };

  const series =
    mode === 'split'
      ? TOKEN_KEYS.map((k) => ({ key: k, values: valuesFor(k), color: SERIES_COLORS[k] }))
      : [
          {
            key: mode,
            values: valuesFor(mode),
            color: mode === 'cost' ? SERIES_COLORS.cost : SERIES_COLORS.total,
          },
        ];

  const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const localX = ratio * VIEWBOX_W;
    if (localX < PAD.l - 4 || localX > VIEWBOX_W - PAD.r + 4) {
      setHoverIdx(null);
      return;
    }
    const idx = Math.round(((localX - PAD.l) / innerW) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const tooltipStyle: CSSProperties =
    hoverIdx !== null
      ? {
          left: `${(xFor(hoverIdx) / VIEWBOX_W) * 100}%`,
          transform:
            hoverIdx > data.length / 2 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
        }
      : {};

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="block w-full"
        style={{ height: VIEWBOX_H }}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
      >
        <g stroke="var(--color-border)" strokeWidth={0.6}>
          {gridY.map((y) => (
            <line key={y} x1={PAD.l} x2={VIEWBOX_W - PAD.r} y1={y} y2={y} />
          ))}
        </g>
        <g
          fontSize={10}
          fontFamily="var(--font-mono)"
          fill="var(--color-muted-foreground)"
        >
          {gridY.map((y, i) => (
            <text key={y} x={PAD.l - 6} y={y + 3} textAnchor="end">
              {fmtY(max * (1 - i / 4))}
            </text>
          ))}
          {xTicks.map((idx) => (
            <text
              key={idx}
              x={xFor(idx)}
              y={VIEWBOX_H - 8}
              textAnchor="middle"
            >
              {data[idx]!.day.slice(5)}
            </text>
          ))}
        </g>

        {mode !== 'split' && (
          <path
            d={areaPath(series[0]!.values, xFor, yFor, innerH)}
            fill={series[0]!.color}
            opacity={0.12}
          />
        )}
        {series.map((s) => (
          <path
            key={s.key}
            d={linePath(s.values, xFor, yFor)}
            fill="none"
            stroke={s.color}
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.9}
          />
        ))}

        {hoverIdx !== null && (
          <line
            x1={xFor(hoverIdx)}
            x2={xFor(hoverIdx)}
            y1={PAD.t}
            y2={VIEWBOX_H - PAD.b}
            stroke="var(--color-muted-foreground)"
            strokeWidth={0.8}
            strokeDasharray="3 3"
            opacity={0.6}
          />
        )}
        {hoverIdx !== null &&
          series.map((s) => (
            <circle
              key={s.key}
              cx={xFor(hoverIdx)}
              cy={yFor(s.values[hoverIdx]!)}
              r={3}
              fill="var(--color-card)"
              stroke={s.color}
              strokeWidth={1.6}
            />
          ))}
      </svg>

      {hovered && hoverIdx !== null && (
        <div
          className={cn(
            'pointer-events-none absolute top-0 z-10 min-w-[170px] rounded-md',
            'border border-border bg-card/95 px-3 py-2 text-xs shadow-md backdrop-blur',
          )}
          style={tooltipStyle}
        >
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">{hovered.day}</div>
          <TooltipRow
            label={t('tooltip.cost')}
            value={fmtCost(hovered.cost)}
            color={SERIES_COLORS.cost}
          />
          <TooltipRow
            label={t('tooltip.total')}
            value={fmtFull(totalTokens(hovered.tokens), locale)}
            color={SERIES_COLORS.total}
          />
          <TooltipRow
            label={t('tooltip.input')}
            value={fmtFull(hovered.tokens.input, locale)}
            color={SERIES_COLORS.input}
          />
          <TooltipRow
            label={t('tooltip.output')}
            value={fmtFull(hovered.tokens.output, locale)}
            color={SERIES_COLORS.output}
          />
          <TooltipRow
            label={t('tooltip.cacheRead')}
            value={fmtFull(hovered.tokens.cacheRead, locale)}
            color={SERIES_COLORS.cacheRead}
          />
          <TooltipRow
            label={t('tooltip.cacheWrite')}
            value={fmtFull(
              hovered.tokens.cacheWrite + hovered.tokens.cacheWrite1h,
              locale,
            )}
            color={SERIES_COLORS.cacheWrite}
          />
          <TooltipRow
            label={t('tooltip.messages')}
            value={fmtFull(hovered.messages, locale)}
          />
        </div>
      )}
    </div>
  );
}

function TooltipRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {color && (
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function linePath(
  values: ReadonlyArray<number>,
  x: (i: number) => number,
  y: (v: number) => number,
): string {
  if (values.length === 0) return '';
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(' ');
}

function areaPath(
  values: ReadonlyArray<number>,
  x: (i: number) => number,
  y: (v: number) => number,
  innerH: number,
): string {
  if (values.length === 0) return '';
  const pts = values.map((v, i) => `${x(i).toFixed(1)} ${y(v).toFixed(1)}`);
  const baseY = (PAD.t + innerH).toFixed(1);
  return `M ${x(0).toFixed(1)} ${baseY} L ${pts.join(' L ')} L ${x(values.length - 1).toFixed(1)} ${baseY} Z`;
}
