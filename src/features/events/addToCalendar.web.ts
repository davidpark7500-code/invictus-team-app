import type { TeamEvent } from '@/data/types';

import { calendarDetails } from './calendarEvent';

export type CalendarResult = 'added' | 'cancelled' | 'error';

/**
 * Web: download a calendar file (.ics). iPhone Safari offers to add it to Calendar;
 * on a computer it opens in Calendar or Outlook, and Google Calendar can import it.
 */
export async function addToCalendar(event: TeamEvent): Promise<CalendarResult> {
  try {
    const d = calendarDetails(event);
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Invictus Team//App//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@invictus-team-app`,
      `DTSTAMP:${utc(new Date())}`,
      d.allDay ? `DTSTART;VALUE=DATE:${day(d.start)}` : `DTSTART:${utc(d.start)}`,
      d.allDay ? `DTEND;VALUE=DATE:${day(d.end)}` : `DTEND:${utc(d.end)}`,
      `SUMMARY:${escape(d.title)}`,
      d.location ? `LOCATION:${escape(d.location)}` : '',
      d.notes ? `DESCRIPTION:${escape(d.notes)}` : '',
      d.url ? `URL:${d.url}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean);
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${d.title.replace(/[^\w\- ]+/g, '').trim() || 'event'}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
    return 'added';
  } catch {
    return 'error';
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
/** 20261124T013000Z */
const utc = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
/** 20261124 (the event's own calendar date) */
const day = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
