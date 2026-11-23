/**
 * Placeholder content so every screen renders before the Supabase
 * project exists. Nothing here is real team content.
 */
import type { Announcement, Customer, Profile, Prospect, Resource, TeamEvent } from './types';

const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number, hour = 19, minute = 30) => {
  const d = new Date(Date.now() + offsetDays * day);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// Titles and sections from the current app's Resources tab, in its order.
// `source` = matched file in the "Invictus Team App" Dropbox folder (all talks confirmed by the owner).
// `url` = that file's address inside the owner's public shared-folder link; the player converts it
// to a direct stream (raw=1). If that folder link is deleted or regenerated, every video URL breaks.
// Items with no Dropbox file have no source yet.
export const resources: Resource[] = [
  { id: 'r-levelup', section: 'Quick Links', title: '\u2B06\uFE0F Level Up!', kind: 'pdf', url: '' },
  { id: 'r-phases', section: 'Quick Links', title: 'Phases of Progression', kind: 'pdf', url: '' },
  { id: 't-resources', section: 'Onboarding Talks', title: 'Know Your Resources', kind: 'video', speaker: 'Park', url: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AA448VozsGbPsvReGzHoHtA/Activation%20Videos/2022-03-19_Resources_Park.mp4?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0', source: 'Activation Videos/2022-03-19_Resources_Park.mp4' },
  { id: 't-owner', section: 'Onboarding Talks', title: 'Business Owner Mentality', kind: 'video', speaker: 'McCann', url: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/APdN3WJyv-15TF8Rl0WYX_c/Activation%20Videos/%2801%29%202021-11-06%20Chad%20and%20Chelsea.mp4?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0', source: 'Activation Videos/(01) 2021-11-06 Chad and Chelsea.mp4' },
  { id: 't-sales', section: 'Onboarding Talks', title: 'Sales Basics 101', kind: 'video', speaker: 'Lutz', url: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AKcD_H0lNnDN4WEDcz79Few/Activation%20Videos/2023-10-17_Training_LutzSalesMindset.mp4?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0', source: 'Activation Videos/2023-10-17_Training_LutzSalesMindset.mp4' },
  { id: 't-networking', section: 'Onboarding Talks', title: 'Networking Basics', kind: 'video', speaker: 'Brown & Jordan', url: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/ACCfmQzCMK71P0Q8vhKFC6A/Activation%20Videos/%2803%29%202021-11-06%20Kyle%20and%20Lucas.mp4?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0', source: 'Activation Videos/(03) 2021-11-06 Kyle and Lucas.mp4' },
  { id: 't-core', section: 'Onboarding Talks', title: 'Core Run', kind: 'video', speaker: 'Brown', url: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AEj8tGKl3ahCWV73yuSlOSU/Activation%20Videos/%2804%29%202021-11-23%20Brown%20Training%20Shortened.mp4?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0', source: 'Activation Videos/(04) 2021-11-23 Brown Training Shortened.mp4' },
  { id: 't-financial', section: 'Onboarding Talks', title: 'Financial Principles', kind: 'video', speaker: 'McCann', url: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/ABwVkK2tZTBdU8TSElR1CEI/Activation%20Videos/2023-06-11_Finances_McCann.mp4?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0', source: 'Activation Videos/2023-06-11_Finances_McCann.mp4' },
  { id: 't-blueprint', section: 'Onboarding Talks', title: 'Power of Blueprint', kind: 'video', speaker: 'Park', url: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/ALEYrysRv2f8eEN1RkPpLrI/Activation%20Videos/2025-04-16_Blueprint_David.mp4?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0', source: 'Activation Videos/2025-04-16_Blueprint_David.mp4' },
  { id: 'r-cna-course', section: 'CNA Resources', title: 'NEW - LTD Maximize VCS with CNA Course!', kind: 'link', url: '' },
  { id: 'r-cna-template', section: 'CNA Resources', title: 'CNA Template', kind: 'pdf', url: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/ANI7vUS9PxFprwYjckzT_OA/CNA/4.%20CNA%20PDF%20Template?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0', source: 'CNA/4. CNA PDF Template' },
  { id: 'r-launch-checklist', section: 'Onboarding', title: '1 - Launch Checklist', kind: 'pdf', url: '' },
  { id: 'r-curriculum', section: 'Onboarding', title: '2 - Onboarding Curriculum', kind: 'pdf', url: '' },
  { id: 'r-launch-orders', section: 'Onboarding', title: '3 - Launch Orders', kind: 'pdf', url: '' },
  { id: 'r-income', section: 'Onboarding', title: 'Income Estimator', kind: 'link', url: '' },
  { id: 'r-guest', section: 'Onboarding', title: 'Guest Registration Link', kind: 'link', url: '' },
  { id: 'r-list-builder', section: 'Onboarding', title: 'NEW - List Builder Template', kind: 'link', url: '' },
  { id: 'r-scalable', section: 'Onboarding', title: 'It\'s All Scalable', kind: 'pdf', url: '' },
  { id: 'r-booklist', section: 'Onboarding', title: 'First Year Booklist', kind: 'pdf', url: '' },
  { id: 'r-roadmap', section: 'Onboarding', title: 'Roadmap & 9 Core Steps', kind: 'pdf', url: '' },
  { id: 'r-budget', section: 'Onboarding', title: 'Budget Sheet', kind: 'pdf', url: '' },
  { id: 'r-reference', section: 'Onboarding', title: 'Invictus Team Reference Guide', kind: 'pdf', url: '' },
  { id: 'r-terminology', section: 'Onboarding', title: 'Invictus Team Terminology', kind: 'pdf', url: '' },
  { id: 'r-whats-next', section: 'Onboarding', title: 'Invictus Team "What\'s Next"', kind: 'pdf', url: '' },
  { id: 'r-onboarding-guide', section: 'Onboarding', title: 'Onboarding Guide', kind: 'pdf', url: '' },
];

export const events: TeamEvent[] = [
  { id: 'e1', title: 'Group Evaluation', type: 'group_evaluation', startsAt: iso(2), endsAt: iso(2, 21, 0), location: 'Zoom', isVirtual: true, registrationUrl: '', description: 'Weekly group evaluation. Bring your guests.' },
  { id: 'e2', title: 'Team Training', type: 'team_training', startsAt: iso(2, 21, 0), endsAt: iso(2, 23, 0), location: 'Zoom', isVirtual: true, registrationUrl: '', description: 'Training for IBOs, directly after Group Evaluation.' },
  { id: 'e3', title: 'Breakthrough Winter Conference', type: 'conference', startsAt: iso(85, 9, 0), endsAt: iso(87, 17, 0), location: 'Kansas City Marriott Downtown', isVirtual: false, registrationUrl: '', description: 'Three-day team conference.' },
  { id: 'e4', title: 'Estate Party', type: 'social', startsAt: iso(30, 18, 0), endsAt: iso(30, 22, 0), location: 'Overland Park, KS', isVirtual: false, description: 'Qualification: 500 Club, 2 new legs, or volume progression.' },
  { id: 'e5', title: 'Group Evaluation', type: 'group_evaluation', startsAt: iso(-5), endsAt: iso(-5, 21, 0), location: 'Zoom', isVirtual: true, recordingUrl: '', description: 'Recording available until next year.' },
];

// Names and pins from the current app's Profiles tab, in its order.
// Photos and bios are still to be supplied. `videoSource` = file in Dropbox ProfileVideos/.
export const profiles: Profile[] = [
  { id: 'kopecky', firstNames: 'Paul and Morgan', lastName: 'Kopecky', pin: 'EDC', founders: false, videoSource: 'ProfileVideos/Kopecky Profile Video.MOV', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/ACgPl8aRbF3RQv-rT-JkoHw/ProfileVideos/Kopecky%20Profile%20Video.MOV?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'brown', firstNames: 'Kyle and Austin', lastName: 'Brown', pin: 'Emerald', founders: true, videoSource: 'ProfileVideos/Brown Profile Video.mov', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AOqGtCRjkZb-Z0HBKDKVMm8/ProfileVideos/Brown%20Profile%20Video.mov?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'jordan', firstNames: 'Lucas and Madison', lastName: 'Jordan', pin: 'Emerald', founders: true },
  { id: 'wyatt', firstNames: 'Courtney and Paige', lastName: 'Wyatt', pin: 'Emerald', founders: true, videoSource: 'ProfileVideos/Wyatt Profile Video.mov', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AD5D2cPJUT6ZGfPEuRPUjd8/ProfileVideos/Wyatt%20Profile%20Video.mov?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'jahnke', firstNames: 'Kalen and Melissa', lastName: 'Jahnke', pin: 'Sapphire', founders: false, videoSource: 'ProfileVideos/Jahnke Profile Video.MOV', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AOqW1sosccbxpltYUKQJJe8/ProfileVideos/Jahnke%20Profile%20Video.MOV?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'raniolo', firstNames: 'Dominic and Katlyn', lastName: 'Raniolo', pin: 'Ruby', founders: true, qualifying: true, videoSource: 'ProfileVideos/Raniolo Profile Video.MOV', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/ABOweEeNlzbNn6iiQ9rqB28/ProfileVideos/Raniolo%20Profile%20Video.MOV?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'brite', firstNames: 'Jared and Brooke', lastName: 'Brite', pin: 'Ruby', founders: false, videoSource: 'ProfileVideos/Brite Profile Video.mov', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AMncg_Bx3V5xGEb25FqcLDI/ProfileVideos/Brite%20Profile%20Video.mov?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'greene', firstNames: 'Justin and Jordann', lastName: 'Greene', pin: 'Ruby', founders: false, videoSource: 'ProfileVideos/Greene Profile Video.mov', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AIwjmVOrbtJPDJsPEQ2IA_I/ProfileVideos/Greene%20Profile%20Video.mov?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'park', firstNames: 'David and Samantha', lastName: 'Park', pin: 'Ruby', founders: false, videoSource: 'ProfileVideos/Park Profile Video.mov', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AK3En2IzrGudEmWgwEdI6Gc/ProfileVideos/Park%20Profile%20Video.mov?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'smith', firstNames: 'Ryan and Veronica', lastName: 'Smith', pin: 'Ruby', founders: false },
  { id: 'arceneaux', firstNames: 'Allen', lastName: 'Arceneaux', pin: 'Platinum', founders: true },
  { id: 'burns', firstNames: 'Ryan and Berenice', lastName: 'Burns', pin: 'Platinum', founders: true },
  { id: 'calahan', firstNames: 'Xavier and Lourdes', lastName: 'Calahan', pin: 'Platinum', founders: true, videoSource: 'ProfileVideos/Calahan Profile Video.mov', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AFL0z4vNg7-pigpNWa9XUdw/ProfileVideos/Calahan%20Profile%20Video.mov?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'jackson', firstNames: 'Cameron and Sheila', lastName: 'Jackson', pin: 'Platinum', founders: true },
  { id: 'mccann', firstNames: 'Chad and Chelsea', lastName: 'McCann', pin: 'Platinum', founders: true, videoSource: 'ProfileVideos/McCann Profile Video.MOV', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AGSF1sL2fyM-CIqNodHVS6Y/ProfileVideos/McCann%20Profile%20Video.MOV?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'mercer', firstNames: 'Chase and Anna', lastName: 'Mercer', pin: 'Platinum', founders: true },
  { id: 'meyer', firstNames: 'Justin and Courtney', lastName: 'Meyer', pin: 'Platinum', founders: true },
  { id: 'osuala', firstNames: 'Chuk', lastName: 'Osuala', pin: 'Platinum', founders: true },
  { id: 'quinn', firstNames: 'Ethan and Abreale', lastName: 'Quinn', pin: 'Platinum', founders: true, videoSource: 'ProfileVideos/Quinn Profile Video.mov', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AJpIj4ygh9XTokZfWQ5YaFY/ProfileVideos/Quinn%20Profile%20Video.mov?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
  { id: 'sanner', firstNames: 'Patrick and Ruthie', lastName: 'Sanner', pin: 'Platinum', founders: true },
  { id: 'streff', firstNames: 'Jeff and Carla', lastName: 'Streff', pin: 'Platinum', founders: false },
  { id: 'nguyen', firstNames: 'Vy', lastName: 'Nguyen', pin: 'Platinum', founders: false },
  { id: 'pugliese', firstNames: 'Chris and Jordan', lastName: 'Pugliese', pin: 'Platinum', founders: false, videoSource: 'ProfileVideos/Pugliese Profile Video.MOV', videoUrl: 'https://www.dropbox.com/scl/fo/u82on05hhuttd7wpmkvl2/AJoPlUHQXsUJCtP9tPcj2N8/ProfileVideos/Pugliese%20Profile%20Video.MOV?rlkey=0irnrzasq5ml33h0cinit2npl&dl=0' },
];

/** Welcome text from the current app's Home tab, verbatim. */
export const WELCOME = [
  "INVICTUS has always been more than just a catchy Team Name to us... it truly is a Lifestyle & a Culture that we are Proud to live out. It is fundamentally established on an Attitude of Winning & that's what matters most to us... seeing others Win in All areas of their Life.",
  'We have found that Influence is Everything & we are excited for your Lives to be Positively influenced in the same way that ours have been. Welcome to the Movement. Welcome to our Culture. Welcome to The INVICTUS Team.',
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
