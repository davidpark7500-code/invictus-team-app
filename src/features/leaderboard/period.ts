/**
 * Ported from Pulse Board (lib/period.ts). Weeks run Wednesday -> Tuesday in the
 * team's home timezone. A week is identified by its Wednesday ("YYYY-MM-DD").
 */
export const APP_TIME_ZONE = 'America/Chicago';

/** First tracked week. Nothing earlier is shown. */
export const LAUNCH_WEEK = '2026-11-04';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function fromUtcDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** The Wednesday on or before a date (matches week_start() in the database). */
export function weekStart(ymd: string): string {
  const d = toUtcDate(ymd);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 4) % 7));
  return fromUtcDate(d);
}

function addDays(ymd: string, days: number): string {
  const d = toUtcDate(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtcDate(d);
}

export const shiftWeek = (week: string, delta: number) => addDays(week, delta * 7);

function todayInTeamZone(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** The current week's Wednesday, never earlier than the launch week. */
export function currentWeek(now: Date = new Date()): string {
  const w = weekStart(todayInTeamZone(now));
  return w < LAUNCH_WEEK ? LAUNCH_WEEK : w;
}

/** All tracked weeks from launch up to and including the current one. */
export function trackedWeeks(now: Date = new Date()): string[] {
  const out: string[] = [];
  for (let w = LAUNCH_WEEK; w <= currentWeek(now); w = shiftWeek(w, 1)) out.push(w);
  return out;
}

function monthDay(ymd: string): string {
  const [, m, d] = ymd.split('-').map(Number);
  return `${MONTH_ABBR[m - 1]} ${d}`;
}

/** "Nov 18 – Nov 24" (Wednesday through Tuesday). */
export const formatWeekRange = (week: string) => `${monthDay(week)} – ${monthDay(addDays(week, 6))}`;

/** "Tue Nov 24", the last day of the week. */
export const formatWeekEnd = (week: string) => `Tue ${monthDay(addDays(week, 6))}`;
