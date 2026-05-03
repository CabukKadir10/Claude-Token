import { describe, it, expect } from 'vitest';
import { formatDateRel, formatDuration, EN_RELATIVE } from './format-date';

const NOW = Date.parse('2026-04-26T12:00:00Z');

describe('formatDateRel', () => {
  it('returns "–" for null', () => {
    expect(formatDateRel(null)).toBe('–');
  });

  it('uses justNow under one minute', () => {
    expect(formatDateRel(NOW - 30_000, { now: NOW })).toBe('just now');
  });

  it('uses minutesAgo under one hour', () => {
    expect(formatDateRel(NOW - 5 * 60_000, { now: NOW })).toBe('5m ago');
  });

  it('uses hoursAgo under one day', () => {
    expect(formatDateRel(NOW - 3 * 3_600_000, { now: NOW })).toBe('3h ago');
  });

  it('uses daysAgo under one week', () => {
    expect(formatDateRel(NOW - 4 * 86_400_000, { now: NOW })).toBe('4d ago');
  });

  it('falls back to ISO date past one week', () => {
    expect(formatDateRel(NOW - 30 * 86_400_000, { now: NOW })).toBe('2026-03-27');
  });

  it('respects an injected label dictionary', () => {
    const tr = {
      ...EN_RELATIVE,
      justNow: 'az önce',
      minutesAgo: (n: number) => `${n}d önce`,
    };
    expect(formatDateRel(NOW - 5 * 60_000, { now: NOW, labels: tr })).toBe('5d önce');
    expect(formatDateRel(NOW - 30_000, { now: NOW, labels: tr })).toBe('az önce');
  });
});

describe('formatDuration', () => {
  it('seconds under a minute', () => {
    expect(formatDuration(45_000)).toBe('45s');
  });

  it('minutes + seconds', () => {
    expect(formatDuration(180_000)).toBe('3m 0s');
    expect(formatDuration(125_000)).toBe('2m 5s');
  });

  it('hours + minutes', () => {
    expect(formatDuration(3_900_000)).toBe('1h 5m');
  });

  it('days + hours', () => {
    expect(formatDuration(90_000_000)).toBe('1d 1h');
  });

  it('clamps negative input to 0', () => {
    expect(formatDuration(-1000)).toBe('0s');
  });
});
