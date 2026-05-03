/**
 * Pure helpers for deriving session/project hints from `.jsonl` filenames
 * and the relative paths produced by `webkitdirectory` / drag-drop.
 *
 * Claude Code names each session log after a UUID:
 *   `~/.claude/projects/<encoded-cwd>/<session-uuid>.jsonl`
 *
 * The encoded cwd uses `-` as a path separator with a leading `-`, e.g.
 *   `-Users-kadir-Desktop-MyApp` → `/Users/kadir/Desktop/MyApp`
 *
 * These helpers are intentionally tolerant: when nothing matches, they fall
 * back to the raw input or `null` so parsing keeps making progress.
 */

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Pull the UUID out of a filename like `abc-1234-….jsonl`. Returns the
 * filename minus `.jsonl` when no UUID is present.
 */
export function sessionIdFromFilename(filename: string): string {
  const base = filename.replace(/\.jsonl$/i, '');
  const m = UUID_RE.exec(base);
  return m ? m[0] : base;
}

/**
 * Reconstruct the original cwd from the encoded folder name in the
 * relative path produced by `webkitdirectory`. Walks up looking for the
 * first segment that contains `-` and is not literally `projects`.
 *
 * Returns `null` when no plausible segment is found.
 */
export function cwdHintFromRelativePath(relativePath: string | null): string | null {
  if (!relativePath) return null;
  const parts = relativePath.split('/');
  // Walk parents, skipping the filename itself (parts.length - 1).
  for (let i = parts.length - 2; i >= 0; i--) {
    const segment = parts[i];
    if (!segment || segment === 'projects' || !segment.includes('-')) continue;
    return '/' + segment.replace(/^-/, '').replace(/-/g, '/');
  }
  return null;
}

/**
 * Last path segment of a cwd, used as the display name. Accepts `\` or `/`
 * as the separator.
 */
export function projectNameFromCwd(cwd: string): string {
  if (!cwd) return '(unknown)';
  const parts = cwd.replace(/\\/g, '/').split('/').filter(Boolean);
  return parts[parts.length - 1] ?? cwd;
}
