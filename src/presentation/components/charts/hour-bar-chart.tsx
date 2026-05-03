'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { HourlyBucket } from '@/domain/entities/hourly-bucket';
import { totalTokens } from '@/domain/value-objects/tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { fmtCompact, fmtFull } from '@/shared/utils/format-number';
import { fmtCost } from '@/shared/utils/format-cost';
import { useLocale } from '@/presentation/components/layout/locale-provider';

interface HourBarChartProps {
  readonly hourly: ReadonlyArray<HourlyBucket>;
}

const VIEWBOX_W = 480;
const VIEWBOX_H = 200;
const PAD = { l: 36, r: 12, t: 12, b: 26 } as const;

/**
 * 24-bar histogram of total tokens by hour-of-day. Hovering a bar shows the
 * raw counts for that hour. Bar widths/heights derive from the viewBox so the
 * chart fills its container without needing a resize observer.
 */
export function HourBarChart({ hourly }: HourBarChartProps) {
  const t = useTranslations('timeline.hourly');
  const { locale } = useLocale();
  const [hoverHour, setHoverHour] = useState<number | null>(null);

  const totals = useMemo(() => hourly.map((b) => totalTokens(b.tokens)), [hourly]);
  const max = useMemo(() => Math.max(1, ...totals), [totals]);

  const innerW = VIEWBOX_W - PAD.l - PAD.r;
  const innerH = VIEWBOX_H - PAD.t - PAD.b;
  const barW = innerW / 24;

  const yTicks = Array.from({ length: 5 }, (_, i) => PAD.t + (innerH / 4) * i);
  const xLabelHours = [0, 3, 6, 9, 12, 15, 18, 21];

  const hovered = hoverHour !== null ? hourly[hoverHour] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        {hovered && (
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {String(hovered.hour).padStart(2, '0')}:00 ·{' '}
            {fmtFull(totalTokens(hovered.tokens), locale)} · {fmtCost(hovered.cost)}
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-1">
        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          className="block w-full"
          style={{ height: VIEWBOX_H }}
          role="img"
        >
          <g stroke="var(--color-border)" strokeWidth={0.6}>
            {yTicks.map((y) => (
              <line key={y} x1={PAD.l} x2={VIEWBOX_W - PAD.r} y1={y} y2={y} />
            ))}
          </g>
          <g
            fontSize={10}
            fontFamily="var(--font-mono)"
            fill="var(--color-muted-foreground)"
          >
            {yTicks.map((y, i) => (
              <text key={y} x={PAD.l - 6} y={y + 3} textAnchor="end">
                {fmtCompact(max * (1 - i / 4))}
              </text>
            ))}
            {xLabelHours.map((h) => (
              <text
                key={h}
                x={PAD.l + h * barW + barW / 2}
                y={VIEWBOX_H - 8}
                textAnchor="middle"
              >
                {String(h).padStart(2, '0')}
              </text>
            ))}
          </g>

          {totals.map((v, h) => {
            const ratio = v / max;
            const barH = ratio * innerH;
            const x = PAD.l + h * barW + 1;
            const y = PAD.t + innerH - barH;
            const isActive = hoverHour === h;
            return (
              <rect
                key={h}
                x={x}
                y={y}
                width={Math.max(0, barW - 2)}
                height={Math.max(0, barH)}
                rx={2}
                fill="var(--color-accent)"
                opacity={hoverHour === null ? 0.85 : isActive ? 1 : 0.4}
                onMouseEnter={() => setHoverHour(h)}
                onMouseLeave={() => setHoverHour(null)}
                style={{ cursor: 'pointer', transition: 'opacity 120ms' }}
              >
                <title>
                  {String(h).padStart(2, '0')}:00 — {fmtFull(v, locale)} · {fmtCost(hourly[h]!.cost)}
                </title>
              </rect>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
