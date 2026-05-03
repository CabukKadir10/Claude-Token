/**
 * Minimal abstraction over a single readable file.
 *
 * Implemented in `infrastructure/parsing/browser-file-source.ts` as a thin
 * wrapper around the browser `File` object. Tests provide an in-memory
 * implementation backed by a string.
 */
export interface FileSource {
  /** Filename including extension, e.g. `abc-123-def.jsonl`. */
  readonly name: string;
  /**
   * Path of this file relative to the dropped folder, or `null` when the
   * file was selected one-by-one (no folder context). Always uses `/` as the
   * separator. Mirrors the browser `File.webkitRelativePath` field.
   */
  readonly relativePath: string | null;
  /** Resolves to the full UTF-8 text of the file. */
  text(): Promise<string>;
}
