'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/presentation/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { toCsv, type CsvColumn } from '@/shared/utils/to-csv';

export type ExportFormat = 'csv' | 'json';

interface ExportMenuProps<T extends Record<string, unknown>> {
  readonly viewKey: 'sessions' | 'projects' | 'by-date';
  readonly rows: ReadonlyArray<T>;
  readonly columns: ReadonlyArray<CsvColumn<T>>;
}

export function ExportMenu<T extends Record<string, unknown>>({
  viewKey,
  rows,
  columns,
}: ExportMenuProps<T>) {
  const t = useTranslations('topbar.export');
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const disabled = rows.length === 0;

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  const handleDownload = (format: ExportFormat) => {
    if (rows.length === 0) return;

    const date = localDateStamp(new Date());
    const fileBase = `claude-tokens-${viewKey}-${date}`;

    if (format === 'csv') {
      downloadText(`${fileBase}.csv`, toCsv(rows, columns), 'text/csv;charset=utf-8');
    } else {
      downloadText(`${fileBase}.json`, `${JSON.stringify(rows, null, 2)}\n`, 'application/json;charset=utf-8');
    }

    closeMenu();
  };

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'list-none [&::-webkit-details-marker]:hidden',
          disabled && 'pointer-events-none opacity-50',
        )}
        onClick={(event) => {
          if (disabled) event.preventDefault();
        }}
      >
        {t('button')}
      </summary>
      <div className="absolute right-0 z-20 mt-1 flex min-w-40 flex-col rounded-md border border-border bg-background p-1 shadow-md">
        <button
          type="button"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'justify-start')}
          onClick={() => handleDownload('csv')}
        >
          {t('csv')}
        </button>
        <button
          type="button"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'justify-start')}
          onClick={() => handleDownload('json')}
        >
          {t('json')}
        </button>
      </div>
    </details>
  );
}

function localDateStamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function downloadText(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
