/**
 * Returns ISO-8601 week key as `YYYY-Www` for a local day key (`YYYY-MM-DD`).
 * ISO week starts on Monday, and week 1 is the week containing Jan 4.
 */
export function isoWeekKey(day: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) throw new Error(`Invalid day key: ${day}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, date));

  // Convert Sunday (0) to 7 so Monday is 1..7.
  const dayOfWeek = utc.getUTCDay() === 0 ? 7 : utc.getUTCDay();
  utc.setUTCDate(utc.getUTCDate() + 4 - dayOfWeek); // Move to Thursday.

  const isoYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);

  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}
