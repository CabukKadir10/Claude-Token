import { BrowserFileSource } from './browser-file-source';

/**
 * Walk every file inside a drag-drop `DataTransfer` and return only the
 * `.jsonl` ones, wrapped as `FileSource` adapters.
 *
 * Uses the (non-standard but universally supported) FileSystem Entries API.
 * Critically, the dropped files do NOT get a `webkitRelativePath`, so we
 * derive a relative path from `entry.fullPath` and pass it through to the
 * source — this is what lets the line parser recover the cwd hint.
 *
 * Browser support: Chrome / Edge / Safari / Firefox all expose
 * `DataTransferItem.webkitGetAsEntry()`. We bail gracefully if it isn't there.
 */
export async function collectDroppedJsonlFiles(
  dataTransfer: DataTransfer,
): Promise<BrowserFileSource[]> {
  const items = dataTransfer.items;
  if (!items || items.length === 0) {
    return collectFromFileList(dataTransfer.files);
  }

  const entries: FileSystemEntry[] = [];
  for (let i = 0; i < items.length; i++) {
    const entry = items[i]!.webkitGetAsEntry?.();
    if (entry) entries.push(entry);
  }

  if (entries.length === 0) return collectFromFileList(dataTransfer.files);

  const collected: BrowserFileSource[] = [];
  for (const entry of entries) {
    await walkEntry(entry, collected);
  }
  return collected;
}

async function walkEntry(entry: FileSystemEntry, out: BrowserFileSource[]): Promise<void> {
  if (entry.isFile) {
    if (!/\.jsonl$/i.test(entry.name)) return;
    const file = await readFile(entry as FileSystemFileEntry);
    const rel = entry.fullPath.replace(/^\//, '');
    out.push(new BrowserFileSource(file, rel));
    return;
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    // readEntries() may return in batches — keep reading until empty.
    while (true) {
      const batch = await readEntriesBatch(reader);
      if (batch.length === 0) break;
      for (const child of batch) {
        await walkEntry(child, out);
      }
    }
  }
}

function readFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

function readEntriesBatch(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject));
}

function collectFromFileList(files: FileList): BrowserFileSource[] {
  const out: BrowserFileSource[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i]!;
    if (/\.jsonl$/i.test(f.name)) out.push(new BrowserFileSource(f));
  }
  return out;
}
