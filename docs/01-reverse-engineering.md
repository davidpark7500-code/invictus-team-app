# Invictus Team app replacement — reverse-engineering pass 1

Date: 2026-11-05. Sources: App Store / Google Play listing snippets (direct fetch blocked by this
sandbox's network policy), 13 TestFlight release emails in your inbox (2020-12 to 2021-11,
earlier generation of the app), the "Invictus App - List Builder Template" sheets in your Drive,
and the Invictus event emails (Group Evaluation, Team Training, Winter Conference).

Confidence tags: [Certain] hard evidence, [Likely] strong inference, [Guessing] gap-fill.

## 1. What the current app is

| Fact | Value | Confidence |
|---|---|---|
| Name | Invictus Team | Certain |
| iOS App Store id | 6461012606 (requires iOS 15.1+) | Certain |
| Android package | com.hauflertechservices.invictus.android | Certain |
| Developer | Haufler Technology Services, LLC, Overland Park KS | Certain |
| Last Android update | 2025-08-18 | Certain |
| Store description | "designed to empower the entrepreneur with resources and relevant material to help them in business and in life", plus the team's stories and culture | Certain |
| Audience | Invictus Team IBOs on the LTD (Leadership Team Development) system | Certain |
| Scale | ~100+ Android installs, 11 iOS ratings. Small, invite-only team audience | Certain |
| Earlier generation | "Invictus Team" by Bridge Consulting & Design, LLC, TestFlight app 1543805477, 2020-12 to 2021-11. The current store id is newer, so the app was rebuilt at least once | Certain |

## 2. Feature inventory (what the replacement must cover)

### 2.1 Authentication and access
- Username + password login, server-issued session so users are not logged in every open. [Certain, from TestFlight 1.4 notes]
- "Save username" convenience. [Certain]
- Session originally 1 hour, later 1 week. [Certain] Replacement: long-lived refresh token, biometric unlock.
- Access is invite-only to the team. There is no public signup. [Likely]

### 2.2 Resources tab
- PDF library with native share sheet. [Certain, TestFlight 1.0(3)]
- CNA content (Customer Needs Assessment) as its own section of Resources. [Certain, TestFlight 1.5(3)]
- "Roadmap / 9 Core" document. [Certain, TestFlight 1.5(2)]
- Replacement needs: categories, search, offline cache, versioned documents, admin upload.

### 2.3 Audios
- Team-produced audio library ("Invictus 2020 Audios"). [Certain, TestFlight 2.1]
- Replacement needs: background playback, lock-screen controls, speed, resume position, download for offline, playlists by event/year.

### 2.4 Events
- Events page with dates (bug fixes for off-by-one dates). [Certain]
- Real event types from your inbox: Group Evaluation (Tue 7:30pm CT, recurring), Team Training, Winter Conference (Jan, KC Marriott), Estate Party, Intro Filming. Tickets currently go through Zoom Events / Eventbrite / Cvent. [Certain]
- Replacement needs: calendar, RSVP/ticket deep-link, add-to-calendar, time zone handling, recordings link after the event.

### 2.5 Team / Leaders ("stories and culture")
- Leader bios with photos. [Certain, TestFlight 1.0(3) "bio typos and pictures"]
- Replacement needs: profile cards, story, pin level, contact links.

### 2.6 List Builder (the one tool in the app that is a workflow, not content)
Reconstructed from the template sheet. [Certain for columns, Guessing for acronym meanings]

Prospects
| Column | Meaning |
|---|---|
| Name | |
| How we communicate | Instagram, Facebook, phone, face to face, TikTok |
| Location | city, state |
| Last contacted | date |
| Notes | relationship context |
| TMS, DTM, MG1, MG2, GE | process checkpoints. GE = Group Evaluation [Likely]. TMS, DTM, MG1, MG2: you need to define these for me [Guessing] |

Customers
| Column |
|---|
| Name, How we communicate, Notes, CNA completed, Products ordered, Thank-you sent, Next steps |

Customer notes
| Column |
|---|
| Name, CNA, Samples given, Products ordered, Thank-you card, Notes / follow-up date |

Replacement needs: prospect pipeline with the checkpoints as stages, customer records with CNA
and product history, follow-up reminders, quick-add from contacts, private per-user data
(this is personal data; an upline must not see a downline's list unless explicitly shared).

### 2.7 Probably present, unconfirmed [Guessing]
- Push notifications for new audio / events.
- Announcements feed.
- Links out to LTD Media app, Amway ordering, Zoom.
- Spanish-language content (a Spanish plan deck exists in your Drive).

Confirm or kill each of these with screenshots.

## 3. Things to settle before code

1. **Platform.** The current app is native mobile. Options:
   - Expo / React Native + Expo Router + Supabase. True Liquid Glass on iOS 26 via `expo-glass-effect`, blur fallback elsewhere. App Store + Play submission under your own developer account. Best fit for audio and push. **Recommended.**
   - Next.js PWA. Fastest, reuses your Omni stack, no store review. Weak on background audio and push on iOS, no native glass.
   - SwiftUI native. Best glass, iOS only, you lose Android.
2. **Repo.** This cannot live inside omni-mission-control. It is a separate product with a separate Supabase project. New repo.
3. **Content rules.** Audio, PDFs and CNA material are Business Support Materials. Amway's BSM rules and LTD's approval process apply to anything you distribute to IBOs. Get written sign-off from the Invictus leadership / LTD before launch. [Likely]
4. **Admin surface.** Someone has to upload audios, PDFs and events. Plan a small web admin from day one.

## 4. Design direction (new, not a port)

- **Material:** Apple Liquid Glass (iOS 26). Translucent layered surfaces, specular edge highlight, light refraction at edges, content scrolls under floating glass bars. Tab bar collapses on scroll, floating toolbar, concentric corner radii.
- **Themes:** light and dark from system, manual override, glass tint adapts. Reduce-transparency and reduce-motion honored.
- **Typography:** SF Pro / system font on device, Inter on web. Large titles, tracking tightened on headings.
- **Color:** one brand accent (Invictus navy or whatever the team mark is), neutrals from the glass, semantic colors for pipeline stages.
- **Navigation:** 5 tabs: Home, Audio, Resources, Events, List. Profile / Team under Home.
- **Home:** greeting, next event, continue-listening, new this week, pinned announcement.
- **Audio player:** mini player docked above the tab bar, expands to full glass sheet.
- **List Builder:** card pipeline, swipe to advance checkpoint, follow-up due badges.

## 5. What I need from you

1. Screenshots of every tab and sub-screen of the current app (you have a login, I cannot run a native app from here). A screen recording walking the whole app is even better.
2. The meaning of TMS, DTM, MG1, MG2.
3. Platform choice from section 3.1.
4. Whether to create a new GitHub repo now, and its name.
5. The Invictus brand mark / colors if they exist.
