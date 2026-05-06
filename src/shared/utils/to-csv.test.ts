import { describe, it, expect } from 'vitest';
import { toCsv } from './to-csv';

describe('toCsv', () => {
  it('serializes headers and rows with UTF-8 BOM', () => {
    const csv = toCsv(
      [
        { project: 'alpha', cost: 12.5, messages: 3 },
        { project: 'beta', cost: 0, messages: 0 },
      ],
      [
        { key: 'project', header: 'Project' },
        { key: 'cost', header: 'Cost' },
        { key: 'messages', header: 'Messages' },
      ],
    );

    expect(csv).toBe('\uFEFFProject,Cost,Messages\r\nalpha,12.5,3\r\nbeta,0,0');
  });

  it('escapes commas, quotes and line breaks', () => {
    const csv = toCsv(
      [{ text: 'hello, "world"\nline2' }],
      [{ key: 'text', header: 'Text' }],
    );

    expect(csv).toBe('\uFEFFText\r\n"hello, ""world""\nline2"');
  });

  it('emits empty cells for nullish and non-finite values', () => {
    const csv = toCsv(
      [{ a: null, b: undefined, c: Number.NaN, d: Number.POSITIVE_INFINITY }],
      [
        { key: 'a', header: 'A' },
        { key: 'b', header: 'B' },
        { key: 'c', header: 'C' },
        { key: 'd', header: 'D' },
      ],
    );

    expect(csv).toBe('\uFEFFA,B,C,D\r\n,,,');
  });
});
