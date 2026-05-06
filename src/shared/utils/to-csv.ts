export interface CsvColumn<T extends Record<string, unknown>> {
  readonly key: keyof T;
  readonly header: string;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: ReadonlyArray<T>,
  columns: ReadonlyArray<CsvColumn<T>>,
): string {
  const headerLine = columns.map((column) => escapeCsvField(column.header)).join(',');
  const dataLines = rows.map((row) =>
    columns
      .map((column) => escapeCsvField(formatCsvValue(row[column.key])))
      .join(','),
  );

  return `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;
}

function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    return value.toString();
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function escapeCsvField(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}
