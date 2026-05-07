'use client';

import { useId, useState } from 'react';

export interface DonutSlice {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly color: string;
  /** Optional secondary text shown next to the legend label. */
  readonly subLabel?: string;
}

interface DonutChartProps {
  readonly slices: ReadonlyArray<DonutSlice>;
  /** Big text shown in the middle when nothing is hovered. */
  readonly centerValue: string;
  readonly centerLabel: string;
  /** Pre-formatted value per slice for the legend (e.g. fmtCost output). */
  readonly formatValue?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly ariaDescription?: string;
}

const SIZE = 220;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Pure-SVG donut chart. Each slice is one `<circle>` element with a stroke
 * dasharray sized to its share of the total — no external chart library and
 * no extra DOM nodes per slice. Hover highlights the active slice and swaps
 * the center label with the slice's value.
 *
 * If `slices` is empty (or all zero), renders a flat ring with a "no data"
 * message so the donut card never collapses.
 */
export function DonutChart({
  slices,
  centerValue,
  centerLabel,
  formatValue,
  ariaLabel,
  ariaDescription,
}: DonutChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const descriptionId = useId();

  const total = slices.reduce((s, x) => s + x.value, 0);
  const visible = slices.filter((s) => s.value > 0);
  const fmt = formatValue ?? defaultFormat;

  let cumulative = 0;
  const segments = visible.map((s) => {
    const fraction = total > 0 ? s.value / total : 0;
    const length = fraction * CIRCUMFERENCE;
    const dashArray = `${length} ${CIRCUMFERENCE - length}`;
    const dashOffset = -cumulative;
    cumulative += length;
    return { slice: s, dashArray, dashOffset, fraction };
  });

  const active = activeId !== null ? visible.find((s) => s.id === activeId) : undefined;
  const activeFraction =
    active !== undefined && total > 0 ? active.value / total : 0;
  const fallbackDescription =
    visible.length === 0
      ? centerLabel
      : visible.map((slice) => `${slice.label}: ${fmt(slice.value)}`).join(', ');
  const description = ariaDescription ?? fallbackDescription;

  return (
    <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-stretch lg:justify-between">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={ariaLabel ?? centerLabel}
          aria-describedby={descriptionId}
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={STROKE}
          />
          {/* Slices — rotated -90deg so they start at 12 o'clock. */}
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {segments.map(({ slice, dashArray, dashOffset }) => {
              const isActive = activeId === slice.id;
              const isDimmed = activeId !== null && !isActive;
              return (
                <circle
                  key={slice.id}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={STROKE}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition: 'opacity 150ms, stroke-width 150ms',
                    opacity: isDimmed ? 0.35 : 1,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setActiveId(slice.id)}
                  onMouseLeave={() => setActiveId(null)}
                />
              );
            })}
          </g>
        </svg>
        <p id={descriptionId} className="sr-only">
          {description}
        </p>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="font-mono text-2xl font-semibold tracking-tight text-foreground">
            {active ? fmt(active.value) : centerValue}
          </div>
          <div className="mt-0.5 max-w-[140px] truncate text-[11px] uppercase tracking-wider text-muted-foreground">
            {active ? active.label : centerLabel}
          </div>
          {active && (
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {Math.round(activeFraction * 100)}%
            </div>
          )}
        </div>
      </div>

      <ul className="flex w-full min-w-0 flex-1 flex-col gap-1 text-sm">
        {visible.length === 0 ? (
          <li className="text-xs text-muted-foreground">—</li>
        ) : (
          visible.map((s) => {
            const fraction = total > 0 ? s.value / total : 0;
            return (
              <li
                key={s.id}
                className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 transition-colors hover:bg-muted"
                onMouseEnter={() => setActiveId(s.id)}
                onMouseLeave={() => setActiveId(null)}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="min-w-0 flex-1 truncate text-foreground">{s.label}</span>
                {s.subLabel && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">{s.subLabel}</span>
                )}
                <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {Math.round(fraction * 100)}%
                </span>
                <span className="shrink-0 font-mono text-xs text-foreground tabular-nums">
                  {fmt(s.value)}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function defaultFormat(n: number): string {
  return String(n);
}
