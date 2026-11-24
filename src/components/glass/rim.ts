/**
 * What makes a translucent panel read as glass rather than a grey box: a
 * bright rim along the top edge where light catches it, a faint sheen that
 * fades down the surface, and a soft shadow lifting it off the background.
 * Shared by the web glass and the native content cards.
 */
export const GLASS_LIGHT = {
  dark: {
    shadow: 'inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(255,255,255,0.04), 0 10px 30px rgba(0,0,0,0.35)',
    sheen: ['rgba(255,255,255,0.09)', 'rgba(255,255,255,0)'] as const,
  },
  light: {
    shadow: 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.35), 0 8px 24px rgba(20,20,40,0.08)',
    sheen: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)'] as const,
  },
};
