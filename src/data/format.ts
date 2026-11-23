export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  return new Date(iso).toLocaleDateString(undefined, opts);
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole calendar days from today, so an event tomorrow morning reads "Tomorrow". */
export function formatRelativeDay(when: Date | string) {
  const diff = Math.round((startOfDay(new Date(when)) - startOfDay(new Date())) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${-diff}d ago`;
  return `In ${diff}d`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

type EventWhen = { date: string; startsAt?: string; endsAt?: string };

/** Local midnight on an event's calendar date. */
export function eventDay(e: { date: string }) {
  const [y, m, d] = e.date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** True until the event's day is over. */
export function isUpcoming(e: EventWhen, now = new Date()) {
  return eventDay(e).getTime() >= startOfDay(now);
}

/** "Tue, Nov 24, 7:30 PM", or the date with "Time TBD" when no time is set. */
export function formatEventWhen(e: EventWhen) {
  if (e.startsAt) return formatDateTime(e.startsAt);
  return `${eventDay(e).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · Time TBD`;
}

/** Venue and city, or "Location TBD". */
export function formatEventPlace(e: { venue?: string; city?: string; isVirtual: boolean }) {
  return [e.venue, e.city].filter(Boolean).join(', ') || (e.isVirtual ? 'Online' : 'Location TBD');
}
