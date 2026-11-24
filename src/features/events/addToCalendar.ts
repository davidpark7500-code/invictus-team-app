import { createEventInCalendarAsync } from 'expo-calendar/legacy';

import type { TeamEvent } from '@/data/types';

import { calendarDetails } from './calendarEvent';

export type CalendarResult = 'added' | 'cancelled' | 'error';

/**
 * iPhone and Android: open the system's own Add Event screen, filled in. The person
 * taps Add; the app never reads their calendar, so no permission prompt.
 */
export async function addToCalendar(event: TeamEvent): Promise<CalendarResult> {
  const d = calendarDetails(event);
  try {
    const result = await createEventInCalendarAsync({
      title: d.title,
      startDate: d.start,
      endDate: d.end,
      allDay: d.allDay,
      location: d.location,
      notes: d.notes,
      url: d.url,
    });
    return result.action === 'saved' ? 'added' : 'cancelled';
  } catch {
    return 'error';
  }
}
