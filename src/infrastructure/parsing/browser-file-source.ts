import type { FileSource } from '@/application/ports/file-source';

/**
 * Adapts a browser `File` to the application-layer `FileSource` port.
 *
 * Two construction paths cover both UI flows:
 *
 *   1. `<input webkitdirectory>` and `<input multiple>` — the browser fills
 *      `File.webkitRelativePath` automatically. We surface it via the
 *      `relativePath` getter.
 *
 *   2. Drag-drop on a folder — the browser does NOT populate
 *      `webkitRelativePath` for entries discovered through the FileSystem
 *      Entries API. The collector resolves the path from `entry.fullPath`
 *      and passes it explicitly via `relativePathOverride`.
 */
export class BrowserFileSource implements FileSource {
  constructor(
    private readonly file: File,
    private readonly relativePathOverride?: string,
  ) {}

  get name(): string {
    return this.file.name;
  }

  get relativePath(): string | null {
    if (this.relativePathOverride !== undefined) return this.relativePathOverride || null;
    return this.file.webkitRelativePath || null;
  }

  text(): Promise<string> {
    return this.file.text();
  }
}

/**
 * Wrap a `FileList`/`File[]` (e.g. from an `<input>` change event), keep only
 * files whose name ends with `.jsonl`, and adapt them to `FileSource`.
 *
 * Accepts both `FileList` (array-like, browser-only) and a plain `File[]`.
 * `Array.from` handles both without depending on the `FileList` global.
 */
export function browserFilesToSources(files: FileList | ReadonlyArray<File>): BrowserFileSource[] {
  return Array.from(files as ArrayLike<File>)
    .filter((f) => /\.jsonl$/i.test(f.name))
    .map((f) => new BrowserFileSource(f));
}
