'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { FolderUp, FileUp, FolderOpen, RefreshCw, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FileSource } from '@/application/ports/file-source';
import {
  browserFilesToSources,
} from '@/infrastructure/parsing/browser-file-source';
import { collectDroppedJsonlFiles } from '@/infrastructure/parsing/folder-drop-collector';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { cn } from '@/shared/utils/cn';
import { useLocale } from '@/presentation/components/layout/locale-provider';
import { fmtFull } from '@/shared/utils/format-number';
import type {
  EventsStatus,
  ParseProgress,
  ParseStats,
} from '@/presentation/hooks/use-events';

interface DropzoneProps {
  readonly status: EventsStatus;
  readonly progress: ParseProgress;
  readonly stats: ParseStats;
  readonly error: string | null;
  readonly onFiles: (sources: ReadonlyArray<FileSource>) => void | Promise<void>;
  readonly onClear: () => void;
  /** Increments whenever parent wants to open folder picker imperatively. */
  readonly reloadPickerRequest?: number;
}

/**
 * Drop area + folder/file picker. Three visual states share one card so the
 * layout doesn't jump as the user moves through them:
 *   - idle     → tall dashed area inviting a drop
 *   - parsing  → same area with a spinner and progress bar
 *   - ready    → compact summary banner (file/event/error counts + actions)
 */
export function Dropzone(props: DropzoneProps) {
  const { status, progress, stats, error, onFiles, onClear, reloadPickerRequest } = props;
  const t = useTranslations('dropzone');
  const { locale } = useLocale();

  const dirInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastReloadPickerRequest = useRef(reloadPickerRequest ?? 0);
  const [dragActive, setDragActive] = useState(false);

  // `webkitdirectory` is non-standard, so set it via ref to keep React/TS happy.
  useEffect(() => {
    const el = dirInputRef.current;
    if (!el) return;
    el.setAttribute('webkitdirectory', '');
    el.setAttribute('directory', '');
    el.setAttribute('mozdirectory', '');
  }, []);

  useEffect(() => {
    const currentRequest = reloadPickerRequest ?? 0;
    if (currentRequest === lastReloadPickerRequest.current) return;
    lastReloadPickerRequest.current = currentRequest;
    if (status !== 'parsing') dirInputRef.current?.click();
  }, [reloadPickerRequest, status]);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (status === 'parsing') return;
      const sources = await collectDroppedJsonlFiles(e.dataTransfer);
      if (sources.length > 0) await onFiles(sources);
    },
    [onFiles, status],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear when leaving the wrapping element, not children.
    if (e.currentTarget === e.target) setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const sources = browserFilesToSources(files);
      // Reset so picking the same path again still fires `change`.
      e.target.value = '';
      if (sources.length > 0) await onFiles(sources);
    },
    [onFiles],
  );

  const isReady = status === 'ready' && stats.fileCount > 0;
  const isParsing = status === 'parsing';

  return (
    <Card
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn(
        'border-dashed transition-colors',
        dragActive && 'border-accent bg-accent/5',
      )}
    >
      <CardContent
        className={cn(
          'flex flex-col items-center justify-center gap-3 text-center',
          isReady ? 'p-4' : 'p-10',
        )}
      >
        {isReady ? (
          <ReadyBanner
            stats={stats}
            locale={locale}
            onPickFolder={() => dirInputRef.current?.click()}
            onPickFiles={() => fileInputRef.current?.click()}
            onClear={onClear}
            t={t}
          />
        ) : isParsing ? (
          <ParsingState progress={progress} t={t} />
        ) : (
          <IdleState
            error={error}
            onPickFolder={() => dirInputRef.current?.click()}
            onPickFiles={() => fileInputRef.current?.click()}
            t={t}
          />
        )}

        <input
          ref={dirInputRef}
          type="file"
          multiple
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleInputChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jsonl,application/jsonl,text/plain"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleInputChange}
        />
      </CardContent>
    </Card>
  );
}

function IdleState({
  error,
  onPickFolder,
  onPickFiles,
  t,
}: {
  error: string | null;
  onPickFolder: () => void;
  onPickFiles: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      <div className="rounded-full bg-muted p-3 text-accent">
        <FolderUp className="h-6 w-6" aria-hidden />
      </div>
      <p className="text-base font-medium">
        {t('titlePrefix')}{' '}
        <code className="font-mono text-accent">{t('titleFolderName')}</code>{' '}
        {t('titleSuffix')}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">{t('subtitle')}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onPickFolder} variant="default" size="sm">
          <FolderOpen className="h-4 w-4" aria-hidden />
          {t('pickFolder')}
        </Button>
        <Button onClick={onPickFiles} variant="outline" size="sm">
          <FileUp className="h-4 w-4" aria-hidden />
          {t('pickFiles')}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500" role="alert">
          {t('errorPrefix')}: {error}
        </p>
      )}
    </>
  );
}

function ParsingState({
  progress,
  t,
}: {
  progress: ParseProgress;
  t: ReturnType<typeof useTranslations>;
}) {
  const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
  return (
    <>
      <div className="rounded-full bg-muted p-3 text-accent">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
      <p className="text-base font-medium">{t('parsing.title')}</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {t('parsing.progress', { done: progress.done, total: progress.total })}
      </p>
      <div
        className="mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress.done}
        aria-valuemin={0}
        aria-valuemax={progress.total}
      >
        <div
          className="h-full bg-accent transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </>
  );
}

function ReadyBanner({
  stats,
  locale,
  onPickFolder,
  onPickFiles,
  onClear,
  t,
}: {
  stats: ParseStats;
  locale: string;
  onPickFolder: () => void;
  onPickFiles: () => void;
  onClear: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-left">
        <div>
          <span className="font-mono text-sm font-medium text-foreground">
            {fmtFull(stats.fileCount, locale)}
          </span>{' '}
          <span className="text-xs text-muted-foreground">{t('ready.files')}</span>
        </div>
        <div>
          <span className="font-mono text-sm font-medium text-foreground">
            {fmtFull(stats.lineCount, locale)}
          </span>{' '}
          <span className="text-xs text-muted-foreground">{t('ready.lines')}</span>
        </div>
        {stats.parseErrors > 0 && (
          <div>
            <span className="font-mono text-sm font-medium text-red-500">
              {fmtFull(stats.parseErrors, locale)}
            </span>{' '}
            <span className="text-xs text-muted-foreground">{t('ready.errors')}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onPickFolder} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" aria-hidden />
          {t('ready.addMore')}
        </Button>
        <Button onClick={onPickFiles} variant="ghost" size="sm">
          <FileUp className="h-4 w-4" aria-hidden />
          {t('pickFiles')}
        </Button>
        <Button onClick={onClear} variant="outline" size="sm">
          <X className="h-4 w-4" aria-hidden />
          {t('ready.clear')}
        </Button>
      </div>
    </div>
  );
}
