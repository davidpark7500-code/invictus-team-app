/** Domain model reverse-engineered from the current Invictus Team app. */

export type Audio = {
  id: string;
  title: string;
  speaker: string;
  series: string;
  durationSec: number;
  recordedAt: string; // ISO date
  url: string;
};

export type ResourceCategory = 'CNA' | 'Roadmap' | 'Plan' | 'Training' | 'Forms';
export type ResourceKind = 'pdf' | 'link' | 'video';

export type Resource = {
  id: string;
  title: string;
  category: ResourceCategory;
  kind: ResourceKind;
  summary: string;
  updatedAt: string;
  url: string;
};

export type EventType = 'group_evaluation' | 'team_training' | 'conference' | 'social';

export type TeamEvent = {
  id: string;
  title: string;
  type: EventType;
  startsAt: string;
  endsAt: string;
  location: string;
  isVirtual: boolean;
  registrationUrl?: string;
  recordingUrl?: string;
  description: string;
};

export type Leader = {
  id: string;
  name: string;
  pin: string;
  location: string;
  story: string;
  photoUrl?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  postedAt: string;
  pinned: boolean;
};

/** Pipeline checkpoints from the List Builder template. Meanings of the first four are TBC. */
export const STAGES = ['tms', 'dtm', 'mg1', 'mg2', 'ge'] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  tms: 'TMS',
  dtm: 'DTM',
  mg1: 'MG1',
  mg2: 'MG2',
  ge: 'Group Eval',
};

export type Channel = 'Phone' | 'Text' | 'Face to face' | 'Instagram' | 'Facebook' | 'TikTok' | 'Other';

export type Prospect = {
  id: string;
  name: string;
  channel: Channel;
  location: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  notes: string;
  checkpoints: Record<Stage, boolean>;
};

export type Customer = {
  id: string;
  name: string;
  channel: Channel;
  notes: string;
  cnaCompleted: boolean;
  samples: string[];
  productsOrdered: string[];
  thankYouSent: boolean;
  nextSteps: string;
};
