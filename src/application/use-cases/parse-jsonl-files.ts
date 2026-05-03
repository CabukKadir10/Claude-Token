import type { FileSource } from '../ports/file-source';
import type { UsageEvent } from '../../domain/entities/usage-event';
import { parseJsonlLine } from '../services/parse-jsonl-line';
import { sessionIdFromFilename, cwdHintFromRelativePath } from '../services/jsonl-paths';

export interface ParseJsonlFilesInput {
  readonly files: ReadonlyArray<FileSource>;
  /**
   * Optional progress callback. Called once per file with `(done, total)`.
   * Use it to drive a progress bar; the call site decides whether to throttle.
   */
  readonly onProgress?: (done: number, total: number) => void;
}

export interface ParseJsonlFilesResult {
  readonly events: UsageEvent[];
  readonly fileCount: number;
  readonly lineCount: number;
  readonly parseErrors: number;
}

/**
 * Read every `FileSource`, split into lines, and produce `UsageEvent`s.
 *
 * Files are processed sequentially to keep memory and progress reporting
 * predictable. Inside a file, lines are processed synchronously — the cost
 * of that loop is small compared to the `await text()` for the file itself.
 */
export async function parseJsonlFiles(
  input: ParseJsonlFilesInput,
): Promise<ParseJsonlFilesResult> {
  const events: UsageEvent[] = [];
  let lineCount = 0;
  let parseErrors = 0;

  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i]!;
    const sessionId = sessionIdFromFilename(file.name);
    const cwdHint = cwdHintFromRelativePath(file.relativePath);

    let text: string;
    try {
      text = await file.text();
    } catch {
      parseErrors += 1;
      input.onProgress?.(i + 1, input.files.length);
      continue;
    }

    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      lineCount += 1;
      const result = parseJsonlLine(line, sessionId, cwdHint);
      if (result.kind === 'event') events.push(result.event);
      else if (result.kind === 'error') parseErrors += 1;
    }

    input.onProgress?.(i + 1, input.files.length);
  }

  return { events, fileCount: input.files.length, lineCount, parseErrors };
}
