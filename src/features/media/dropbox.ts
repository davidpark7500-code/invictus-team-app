/**
 * Turn a Dropbox share link into a direct-file URL the in-app player can stream.
 * `raw=1` makes Dropbox serve the file bytes instead of its preview page, so
 * playback stays inside the app and never opens Dropbox.
 */
export function toDirectMediaUrl(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!/(^|\.)dropbox\.com$/.test(u.hostname)) return url;
    u.searchParams.delete('dl');
    u.searchParams.delete('st');
    u.searchParams.set('raw', '1');
    return u.toString();
  } catch {
    return url;
  }
}
