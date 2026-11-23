import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';

import * as builtIn from './mock';
import type { EventType, Profile, Resource, ResourceKind, TeamEvent } from './types';

/**
 * Team content: resources, events, profiles and the Home welcome text.
 *
 * Admins edit it in the Supabase dashboard (Table Editor and Storage), and the app
 * picks changes up the next time it's opened or brought back to the front, with
 * no app update. The last copy that loaded is kept on the phone so the app opens
 * instantly and works offline. Until anything has loaded (demo mode, first launch
 * offline) the app shows the content built into it (`mock.ts`).
 */
export type Content = {
  resources: Resource[];
  events: TeamEvent[];
  profiles: Profile[];
  /** Home welcome card, one string per paragraph. */
  welcome: string[];
};

type ContentState = Content & {
  /** Where the content on screen came from. */
  source: 'built-in' | 'saved' | 'live';
  refresh: () => Promise<void>;
};

const CACHE_KEY = 'invictus.content.v1';
/** Signed links to private files last this long; content refreshes well before that. */
const SIGNED_URL_SECONDS = 60 * 60 * 24;
/** Resources tab section order; unknown sections go last, in the order they appear. */
const SECTION_ORDER = ['Quick Links', 'Onboarding Talks', 'CNA Resources', 'Onboarding'];

const BUILT_IN: Content = {
  resources: builtIn.resources,
  events: builtIn.events,
  profiles: builtIn.profiles,
  welcome: builtIn.WELCOME,
};

const ContentContext = createContext<ContentState | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [content, setContent] = useState<Content>(BUILT_IN);
  const [source, setSource] = useState<ContentState['source']>('built-in');

  // The copy saved on this phone, for an instant start.
  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Content;
        setContent((current) => (current === BUILT_IN ? saved : current));
        setSource((current) => (current === 'built-in' ? 'saved' : current));
      })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase || !session) return;
    try {
      const next = await loadContent();
      setContent(next);
      setSource('live');
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
    } catch {
      // Keep showing what we have; the next refresh tries again.
    }
  }, [session]);

  // Load on sign-in and whenever the app comes back to the front.
  useEffect(() => {
    // After this render: refresh only sets state once the network answers.
    queueMicrotask(() => void refresh());
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const value = useMemo(() => ({ ...content, source, refresh }), [content, source, refresh]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>');
  return ctx;
}

// ---------------------------------------------------------------- loading

type ResourceRow = {
  id: string;
  slug: string | null;
  title: string;
  section: string;
  kind: ResourceKind;
  url: string | null;
  storage_path: string | null;
  speaker: string | null;
  source: string | null;
  duration_sec: number | null;
  sort_order: number;
};
type EventRow = {
  id: string;
  slug: string | null;
  title: string;
  type: EventType;
  event_date: string;
  starts_at: string | null;
  ends_at: string | null;
  venue: string;
  city: string;
  is_virtual: boolean;
  registration_url: string | null;
  recording_url: string | null;
  description: string;
};
type ProfileRow = {
  id: string;
  slug: string | null;
  first_names: string;
  last_name: string;
  pin: string;
  founders: boolean;
  qualifying: boolean;
  bio: string;
  photo_url: string | null;
  video_url: string | null;
  video_source: string | null;
  sort_order: number;
};

async function loadContent(): Promise<Content> {
  const db = supabase!;
  const [res, ev, pr, txt] = await Promise.all([
    db.from('resources').select('*').eq('published', true).order('sort_order'),
    db.from('events').select('*').eq('published', true).order('event_date'),
    db.from('team_profiles').select('*').order('sort_order'),
    db.from('app_text').select('key, value'),
  ]);
  const failed = res.error ?? ev.error ?? pr.error ?? txt.error;
  if (failed) throw failed;

  const resourceRows = (res.data ?? []) as ResourceRow[];
  const signed = await signPrivateFiles(resourceRows.map((r) => r.storage_path).filter((p): p is string => !!p));

  const sectionRank = (s: string) => {
    const i = SECTION_ORDER.indexOf(s);
    return i === -1 ? SECTION_ORDER.length : i;
  };
  const resources = resourceRows
    .slice()
    .sort((a, b) => sectionRank(a.section) - sectionRank(b.section) || a.sort_order - b.sort_order)
    .map<Resource>((r) => ({
      id: r.slug ?? r.id,
      title: r.title,
      section: r.section,
      kind: r.kind,
      speaker: r.speaker ?? undefined,
      url: (r.storage_path ? signed[r.storage_path] : undefined) ?? r.url ?? '',
      source: r.source ?? undefined,
      durationSec: r.duration_sec ?? undefined,
    }));

  const events = ((ev.data ?? []) as EventRow[]).map<TeamEvent>((e) => ({
    id: e.slug ?? e.id,
    title: e.title,
    type: e.type,
    date: e.event_date,
    startsAt: e.starts_at ?? undefined,
    endsAt: e.ends_at ?? undefined,
    venue: e.venue || undefined,
    city: e.city || undefined,
    isVirtual: e.is_virtual,
    registrationUrl: e.registration_url ?? undefined,
    recordingUrl: e.recording_url ?? undefined,
    description: e.description,
  }));

  const profiles = ((pr.data ?? []) as ProfileRow[]).map<Profile>((p) => ({
    id: p.slug ?? p.id,
    firstNames: p.first_names,
    lastName: p.last_name,
    pin: p.pin,
    founders: p.founders,
    qualifying: p.qualifying,
    bio: p.bio || undefined,
    photoUrl: p.photo_url ?? undefined,
    videoUrl: p.video_url ?? undefined,
    videoSource: p.video_source ?? undefined,
  }));

  const text = Object.fromEntries(((txt.data ?? []) as { key: string; value: string }[]).map((t) => [t.key, t.value]));
  const welcome = text.welcome
    ? text.welcome
        .split(/\n\s*\n/)
        .map((p: string) => p.trim())
        .filter(Boolean)
    : BUILT_IN.welcome;

  return { resources, events, profiles, welcome };
}

/** Short-lived links for files in the private "resources" bucket, keyed by path. */
async function signPrivateFiles(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data, error } = await supabase!.storage.from('resources').createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error || !data) return {};
  const pairs: [string, string][] = [];
  for (const d of data) if (d.path && d.signedUrl) pairs.push([d.path, d.signedUrl]);
  return Object.fromEntries(pairs);
}
