import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { supabase, supabaseConfigured } from './supabase';

/**
 * Personal accounts. Sign-up needs the shared team code, which the database
 * checks (migration 0004), so outsiders can't create an account.
 * Couples share one account: "David & Samantha Park".
 */
export type SignUpInput = { fullName: string; email: string; password: string; teamCode: string };

export type Role = 'member' | 'admin';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  role: Role;
  /** No Supabase env configured: let everyone in on mock data. */
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (input: SignUpInput) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  // Role as loaded for one user; anyone else (or signed out) is a member until theirs loads.
  const [loadedRole, setLoadedRole] = useState<{ userId: string; role: Role } | null>(null);
  const role: Role = loadedRole && loadedRole.userId === session?.user.id ? loadedRole.role : 'member';

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!supabase || !userId) return;
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
      .then(({ data }) => setLoadedRole({ userId, role: data?.role === 'admin' ? 'admin' : 'member' }));
  }, [session?.user.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      role,
      demoMode: !supabaseConfigured,
      async signIn(email, password) {
        if (!supabase) return 'Supabase is not configured.';
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        return error ? 'That email and password didn\u2019t match.' : null;
      },
      async signUp({ fullName, email, password, teamCode }) {
        if (!supabase) return 'Supabase is not configured.';
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { full_name: fullName.trim(), team_code: teamCode.trim() } },
        });
        if (!error) return null;
        if (/team code/i.test(error.message)) return 'That team code isn\u2019t right. Ask your upline for it.';
        if (/cannot be used/i.test(error.message)) return 'That email address can\u2019t be used.';
        if (/registered|exists/i.test(error.message)) return 'There\u2019s already an account with that email. Sign in instead.';
        return error.message;
      },
      async signOut() {
        await supabase?.auth.signOut();
      },
    }),
    [session, loading, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
