'use client';

import { useCallback, useState } from 'react';
import type { FileSource } from '@/application/ports/file-source';
import type { UsageEvent } from '@/domain/entities/usage-event';
import { parseJsonlFiles } from '@/application/use-cases/parse-jsonl-files';

export type EventsStatus = 'idle' | 'parsing' | 'ready' | 'error';

export interface ParseStats {
  readonly fileCount: number;
  readonly lineCount: number;
  readonly parseErrors: number;
}

export interface ParseProgress {
  readonly done: number;
  readonly total: number;
}

export interface UseEventsResult {
  readonly events: ReadonlyArray<UsageEvent>;
  readonly status: EventsStatus;
  readonly progress: ParseProgress;
  readonly stats: ParseStats;
  readonly error: string | null;
  /** Parse a fresh batch of files and append the resulting events to the current set. */
  readonly addFiles: (sources: ReadonlyArray<FileSource>) => Promise<void>;
  /** Wipe all events and stats; resets status to `idle`. */
  readonly clear: () => void;
}

const ZERO_PROGRESS: ParseProgress = { done: 0, total: 0 };
const ZERO_STATS: ParseStats = { fileCount: 0, lineCount: 0, parseErrors: 0 };

/**
 * Holds the raw `UsageEvent[]` derived from one or more drag-drop / picker
 * batches. The hook is intentionally additive: each `addFiles` call appends
 * to the current set so the user can drop a few projects, then drop more.
 *
 * Errors during parsing are surfaced via `status === 'error'`; the previous
 * event set is preserved so a partial failure doesn't blow away earlier work.
 */
export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [status, setStatus] = useState<EventsStatus>('idle');
  const [progress, setProgress] = useState<ParseProgress>(ZERO_PROGRESS);
  const [stats, setStats] = useState<ParseStats>(ZERO_STATS);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(async (sources: ReadonlyArray<FileSource>) => {
    if (sources.length === 0) return;
    setStatus('parsing');
    setError(null);
    setProgress({ done: 0, total: sources.length });
    try {
      const result = await parseJsonlFiles({
        files: sources,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      setEvents((prev) => prev.concat(result.events));
      setStats((prev) => ({
        fileCount: prev.fileCount + result.fileCount,
        lineCount: prev.lineCount + result.lineCount,
        parseErrors: prev.parseErrors + result.parseErrors,
      }));
      setStatus('ready');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const clear = useCallback(() => {
    setEvents([]);
    setStats(ZERO_STATS);
    setProgress(ZERO_PROGRESS);
    setError(null);
    setStatus('idle');
  }, []);

  return { events, status, progress, stats, error, addFiles, clear };
}
