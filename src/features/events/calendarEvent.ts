import { formatEventPlace } from '@/data/format';
import { registrationUrlOf } from '@/data/mock';
import type { TeamEvent } from '@/data/types';

/** What goes into the calendar for a team event, shared by the iPhone and web versions. */
export type CalendarDetails = {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  notes?: string;
  url?: string;
};

const DEFAULT_LENGTH_MS = 2 * 60 * 60 * 1000;

export function calendarDetails(event: TeamEvent): CalendarDetails {
  const url = registrationUrlOf(event);
  const notes = [event.description, url ? `Register: ${url}` : ''].filter(Boolean).join('\n\n') || undefined;
  const place = formatEventPlace(event);
  const location = place === 'Location TBD' ? undefined : place;

  if (event.startsAt) {
    const start = new Date(event.startsAt);
    const end = event.endsAt ? new Date(event.endsAt) : new Date(start.getTime() + DEFAULT_LENGTH_MS);
    return { title: event.title, start, end, allDay: false, location, notes, url };
  }
  // Time not set yet: an all-day entry on the event's date.
  const [y, m, d] = event.date.split('-').map(Number);
  return {
    title: event.title,
    start: new Date(y, m - 1, d),
    end: new Date(y, m - 1, d + 1),
    allDay: true,
    location,
    notes,
    url,
  };
}
