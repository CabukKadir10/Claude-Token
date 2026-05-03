/**
 * Shrink a UUID-like identifier for display in narrow columns.
 *   "a1b2c3d4-e5f6-7890-abcd-ef1234567890" → "a1b2c3d4…7890"
 */
export function shortSid(sid: string | null | undefined): string {
  if (!sid || sid === '(unknown)') return sid ?? '';
  if (sid.length <= 14) return sid;
  return sid.slice(0, 8) + '…' + sid.slice(-4);
}
