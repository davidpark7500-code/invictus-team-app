# Content map

Where each item comes from. Screenshots of the current app say **what goes where**; the
"Invictus Team App" Dropbox folder holds **the files**. Design is ours, not the old app's.

## Tabs
Home · Events · Profiles · Resources. No Audio tab (audio lives in Resources). No More tab
(sign-out is in Settings).

## Resources — matched to Dropbox
| Item | Dropbox file | Confidence |
|---|---|---|
| Know Your Resources (Park) | Activation Videos/2022-03-19_Resources_Park.mp4 | Likely |
| Business Owner Mentality (McCann) | Activation Videos/(01) 2021-11-06 Chad and Chelsea.mp4 | Confirmed |
| Sales Basics 101 (Lutz) | Activation Videos/2023-10-17_Training_LutzSalesMindset.mp4 | Likely |
| Networking Basics (Brown & Jordan) | Activation Videos/(03) 2021-11-06 Kyle and Lucas.mp4 | Confirmed |
| Core Run (Brown) | Activation Videos/(04) 2021-11-23 Brown Training Shortened.mp4 | Confirmed (for now) |
| Financial Principles (McCann) | Activation Videos/2023-06-11_Finances_McCann.mp4 | Likely |
| Power of Blueprint (Park) | Activation Videos/2025-04-16_Blueprint_David.mp4 | Likely |
| CNA Template | CNA/4. CNA PDF Template (no extension) | Likely |

All seven talks and the CNA Template are recorded as `source` in `src/data/mock.ts`.

**Not in Dropbox:** Level Up!, Phases of Progression, LTD Maximize VCS with CNA Course link,
all Onboarding PDFs and links, any audio (Archived Audios folders are empty).

**In Dropbox, not on the screenshots (left out for now, owner's call):** 7 more CNA items, Amway
Compensation Plan video, 10 onboarding videos in ProfileVideos/Onboarding, unmatched
Activation Videos (Hunt, Allison and Jared, HuntJordan, Pfeifer, 2025 Brown Networking).

**Excluded:** Loehr and Sitzman (no longer on the team), including Sitzman training videos;
everything in "Unused Activation Videos" and "ProfileVideos - ARCHIVED 11-2025".

## Profiles
23 names and pins from the screenshots. Profile videos exist for Kopecky, Brown, Wyatt,
Jahnke, Raniolo, Brite, Greene, Park, Calahan, McCann, Quinn, Pugliese. No photos or bios in
Dropbox yet. Rows between Greene and Park may have been missed in the screenshots.

## Hosting
Decided: compressed 720p copies in Dropbox `App Videos/`, streamed via view-only links.
Essentials allows ~1 TB/day of shared-link traffic. `scripts/convert-videos.sh` makes the copies.

## Sharing profiles
Plan: `profile_shares` table (migration 0003) issues a random token that expires after
7 days; a public web page `/p/<token>` shows photo, bio and video; admins can revoke early.
Needs the backend and a web host. The Share button is in place but disabled until then.
