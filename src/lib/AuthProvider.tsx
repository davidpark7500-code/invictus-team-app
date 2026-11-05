import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { supabase, supabaseConfigured } from './supabase';

/**
 * Two accounts only: a shared team login and an admin login.
 * People type a plain username; Supabase Auth needs an email, so a bare
 * username is mapped to `<username>@<EXPO_PUBLIC_LOGIN_DOMAIN>`.
 */
const LOGIN_DOMAIN = process.env.EXPO_PUBLIC_LOGIN_DOMAIN ?? 'invictus.app';

export function usernameToEmail(username: string) {
  const u = username.trim().toLowerCase();
  return u.includes('@') ? u : `${u}@${LOGIN_DOMAIN}`;
}

export type Role = 'member' | 'admin';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  role: Role;
  /** No Supabase env configured: let everyone in on mock data. */
  demoMode: boolean;
  signIn: (username: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [role, setRole] = useState<Role>('member');

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
    if (!supabase || !userId) {
      setRole('member');
      return;
    }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
      .then(({ data }) => setRole(data?.role === 'admin' ? 'admin' : 'member'));
  }, [session?.user.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      role,
      demoMode: !supabaseConfigured,
      async signIn(username, password) {
        if (!supabase) return 'Supabase is not configured.';
        const { error } = await supabase.auth.signInWithPassword({
          email: usernameToEmail(username),
          password,
        });
        return error ? 'That username and password didn\u2019t match.' : null;
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
