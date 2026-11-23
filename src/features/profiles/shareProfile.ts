import { Platform, Share } from 'react-native';

import type { Profile } from '@/data/types';
import { supabase } from '@/lib/supabase';

/** Where prospects open a shared profile: a page on the team's website, no sign-in. */
const SHARE_BASE = 'https://invictus-team-app.vercel.app/p/';

export type ShareResult = 'shared' | 'copied' | 'not-configured' | 'error';

/**
 * Make a private 7-day link to this profile and hand it to the share sheet
 * (Messages, Mail, AirDrop...). On a computer the link is copied instead.
 */
export async function shareProfile(profile: Profile): Promise<ShareResult> {
  if (!supabase) return 'not-configured';
  const { data: token, error } = await supabase.rpc('create_profile_share', { profile_slug: profile.id });
  if (error || typeof token !== 'string') return 'error';

  const url = SHARE_BASE + token;
  const names = `${profile.firstNames} ${profile.lastName}`;
  const message = `Meet ${names} from the Invictus Team: ${url}`;

  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: names, text: `Meet ${names} from the Invictus Team`, url });
        return 'shared';
      } catch {
        // Cancelled or not allowed: fall back to copying.
      }
    }
    await nav?.clipboard?.writeText(url).catch(() => {});
    return 'copied';
  }
  // iOS shows the link as a rich preview when it's passed as `url`; Android only reads `message`.
  await Share.share(Platform.OS === 'ios' ? { message: `Meet ${names} from the Invictus Team`, url } : { message });
  return 'shared';
}
