/** Domain model reverse-engineered from the current Invictus Team app. */

export type ResourceKind = 'pdf' | 'audio' | 'video' | 'link';

/**
 * Everything on the Resources tab: PDFs, audio, video and web links,
 * grouped into sections in the order the current app shows them.
 */
export type Resource = {
  id: string;
  title: string;
  section: string;
  kind: ResourceKind;
  /** Talks credit the speaker by last name. */
  speaker?: string;
  /** Playable or openable URL once the file is hosted. Empty until then. */
  url: string;
  /** Where the original lives in the "Invictus Team App" Dropbox folder, if matched. */
  source?: string;
  durationSec?: number;
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

/** A leader on the Profiles tab. */
export type Profile = {
  id: string;
  /** "Paul and Morgan" */
  firstNames: string;
  lastName: string;
  /** EDC, Emerald, Sapphire, Ruby, Platinum. */
  pin: string;
  founders: boolean;
  /** Shown as "Qual": qualifying for the pin. */
  qualifying?: boolean;
  bio?: string;
  photoUrl?: string;
  videoUrl?: string;
  /** Profile video in Dropbox ProfileVideos/, if one exists. */
  videoSource?: string;
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
