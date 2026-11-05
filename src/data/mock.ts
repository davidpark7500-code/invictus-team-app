/**
 * Placeholder content so every screen renders before the Supabase
 * project exists. Nothing here is real team content.
 */
import type { Announcement, Audio, Customer, Leader, Prospect, Resource, TeamEvent } from './types';

const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number, hour = 19, minute = 30) => {
  const d = new Date(Date.now() + offsetDays * day);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const audios: Audio[] = [
  { id: 'a1', title: 'Own the Tools', speaker: 'David Park', series: 'Team Meeting 2026', durationSec: 2143, recordedAt: iso(-3), url: '' },
  { id: 'a2', title: 'Leveraging the System', speaker: 'Charles M.', series: 'Team Meeting 2026', durationSec: 1870, recordedAt: iso(-10), url: '' },
  { id: 'a3', title: 'Winter Conference Opening', speaker: 'Invictus Leadership', series: 'Winter Conference 2026', durationSec: 3412, recordedAt: iso(-40), url: '' },
  { id: 'a4', title: 'Building Your List', speaker: 'Samantha Park', series: 'Fundamentals', durationSec: 1502, recordedAt: iso(-60), url: '' },
  { id: 'a5', title: 'The Customer Needs Assessment', speaker: 'Paul K.', series: 'Fundamentals', durationSec: 1655, recordedAt: iso(-75), url: '' },
];

export const resources: Resource[] = [
  { id: 'r1', title: 'CNA Guide', category: 'CNA', kind: 'pdf', summary: 'How to run a Customer Needs Assessment, with the question flow.', updatedAt: iso(-12), url: '' },
  { id: 'r2', title: 'CNA Worksheet', category: 'CNA', kind: 'pdf', summary: 'Printable worksheet to fill in during the assessment.', updatedAt: iso(-12), url: '' },
  { id: 'r3', title: 'Roadmap: 9 Core', category: 'Roadmap', kind: 'pdf', summary: 'The nine core habits and the order to build them.', updatedAt: iso(-30), url: '' },
  { id: 'r4', title: 'The Plan (English)', category: 'Plan', kind: 'pdf', summary: 'Current plan deck.', updatedAt: iso(-45), url: '' },
  { id: 'r5', title: 'El Plan (Español)', category: 'Plan', kind: 'pdf', summary: 'Plan deck, Spanish.', updatedAt: iso(-45), url: '' },
  { id: 'r6', title: 'Launch / Onboarding Checklist', category: 'Training', kind: 'link', summary: 'Shared checklist for a new IBO’s first 30 days.', updatedAt: iso(-5), url: '' },
  { id: 'r7', title: 'Ideas for Building Your List', category: 'Training', kind: 'pdf', summary: 'Prompts and memory joggers for writing out your list of names.', updatedAt: iso(-20), url: '' },
];

export const events: TeamEvent[] = [
  { id: 'e1', title: 'Group Evaluation', type: 'group_evaluation', startsAt: iso(2), endsAt: iso(2, 21, 0), location: 'Zoom', isVirtual: true, registrationUrl: '', description: 'Weekly group evaluation. Bring your guests.' },
  { id: 'e2', title: 'Team Training', type: 'team_training', startsAt: iso(2, 21, 0), endsAt: iso(2, 23, 0), location: 'Zoom', isVirtual: true, registrationUrl: '', description: 'Training for IBOs, directly after Group Evaluation.' },
  { id: 'e3', title: 'Breakthrough Winter Conference', type: 'conference', startsAt: iso(85, 9, 0), endsAt: iso(87, 17, 0), location: 'Kansas City Marriott Downtown', isVirtual: false, registrationUrl: '', description: 'Three-day team conference.' },
  { id: 'e4', title: 'Estate Party', type: 'social', startsAt: iso(30, 18, 0), endsAt: iso(30, 22, 0), location: 'Overland Park, KS', isVirtual: false, description: 'Qualification: 500 Club, 2 new legs, or volume progression.' },
  { id: 'e5', title: 'Group Evaluation', type: 'group_evaluation', startsAt: iso(-5), endsAt: iso(-5, 21, 0), location: 'Zoom', isVirtual: true, recordingUrl: '', description: 'Recording available until next year.' },
];

export const leaders: Leader[] = [
  { id: 'l1', name: 'David & Samantha Park', pin: 'Platinum', location: 'Kansas City, MO', story: 'Started in 2015. Built the business alongside full-time careers.' },
  { id: 'l2', name: 'Paul & Angie Kopecky', pin: 'Diamond', location: 'Overland Park, KS', story: 'Founders of the Invictus team.' },
  { id: 'l3', name: 'Blake Harris', pin: 'Emerald', location: 'Kansas City, MO', story: 'Leads the Harris team within Invictus.' },
];

export const announcements: Announcement[] = [
  { id: 'n1', title: 'Winter Conference tickets open', body: 'Early pricing ends in two weeks. Book the room block at the Marriott.', postedAt: iso(-1), pinned: true },
  { id: 'n2', title: 'New CNA worksheet', body: 'The worksheet was reformatted for printing. Grab it under Resources.', postedAt: iso(-12), pinned: false },
];

export const prospects: Prospect[] = [
  { id: 'p1', name: 'Mike R.', channel: 'Facebook', location: 'Overland Park, KS', lastContactedAt: iso(-4), nextFollowUpAt: iso(1), notes: 'Friends in college, now married, 3 kids, works in sales.', checkpoints: { tms: true, dtm: true, mg1: false, mg2: false, ge: false } },
  { id: 'p2', name: 'Sydney L.', channel: 'Face to face', location: 'Chicago, IL', lastContactedAt: iso(-9), nextFollowUpAt: iso(-1), notes: 'Friends in high school, now engaged.', checkpoints: { tms: true, dtm: false, mg1: false, mg2: false, ge: false } },
  { id: 'p3', name: 'Yasmine J.', channel: 'Instagram', location: 'Cicero, IL', lastContactedAt: iso(-2), notes: 'College friend, substitute teacher.', checkpoints: { tms: true, dtm: true, mg1: true, mg2: false, ge: false } },
  { id: 'p4', name: 'Rachel T.', channel: 'Phone', location: 'Oak Lawn, IL', lastContactedAt: iso(-20), nextFollowUpAt: iso(3), notes: 'High school and college friend.', checkpoints: { tms: true, dtm: true, mg1: true, mg2: true, ge: false } },
];

export const customers: Customer[] = [
  { id: 'c1', name: 'Aunt Janet', channel: 'Phone', notes: 'Bought 20 years ago, loves LOC.', cnaCompleted: true, samples: [], productsOrdered: ['LOC', 'Sleep gummies'], thankYouSent: true, nextSteps: 'Check in December' },
  { id: 'c2', name: 'Peggy C.', channel: 'Text', notes: '', cnaCompleted: true, samples: ['Wellness Bars', 'Balance Within Probiotic'], productsOrdered: ['CBD Facial Oil', 'Twist Tubes'], thankYouSent: true, nextSteps: 'Reorder reminder' },
  { id: 'c3', name: 'Melissa S.', channel: 'Phone', notes: 'Physician’s assistant.', cnaCompleted: true, samples: ['Fiber Powder'], productsOrdered: [], thankYouSent: false, nextSteps: 'Send thank-you card' },
];
