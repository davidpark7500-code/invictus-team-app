import { initialsOf } from '@/features/leaderboard/rank';
import { useAuth } from '@/lib/AuthProvider';

/** The signed-in person's display name and initials (couples share one account). */
export function useAccount() {
  const { session, demoMode } = useAuth();
  const meta = session?.user.user_metadata as { full_name?: string } | undefined;
  const name = meta?.full_name?.trim() || session?.user.email || (demoMode ? 'Demo Member' : 'Team Member');
  return { name, initials: initialsOf(name) || '?', email: session?.user.email };
}
