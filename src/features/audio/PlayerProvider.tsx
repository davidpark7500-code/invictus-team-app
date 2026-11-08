import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Resource } from '@/data/types';

/**
 * Playback state only. Real playback (expo-audio, lock-screen controls,
 * background mode) lands once the audio catalogue has real URLs.
 */
type PlayerState = {
  track: Resource | null;
  playing: boolean;
  positionSec: number;
  play: (track: Resource) => void;
  toggle: () => void;
  seekBy: (deltaSec: number) => void;
  clear: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [track, setTrack] = useState<Resource | null>(null);
  const [playing, setPlaying] = useState(false);
  const [positionSec, setPosition] = useState(0);

  const play = useCallback((next: Resource) => {
    setTrack((current) => {
      if (current?.id !== next.id) setPosition(0);
      return next;
    });
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => setPlaying((p) => (track ? !p : p)), [track]);
  const seekBy = useCallback(
    (delta: number) =>
      setPosition((p) => Math.max(0, Math.min(track?.durationSec ?? Number.MAX_SAFE_INTEGER, p + delta))),
    [track],
  );
  const clear = useCallback(() => {
    setTrack(null);
    setPlaying(false);
    setPosition(0);
  }, []);

  const value = useMemo(
    () => ({ track, playing, positionSec, play, toggle, seekBy, clear }),
    [track, playing, positionSec, play, toggle, seekBy, clear],
  );
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return ctx;
}
