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

/**
 * Address for the web PDF viewer to download a file's bytes. Same as
 * `toDirectMediaUrl`, but on dl.dropboxusercontent.com, which answers with the
 * file itself (no redirect) and allows other sites to read it; the www link's
 * first redirect does not, so the browser would block it. Don't use it to show
 * a PDF in a browser: Safari offers to download it instead. Checked 2026-11-23.
 */
export function toDirectFileUrl(url: string): string {
  const direct = toDirectMediaUrl(url);
  try {
    const u = new URL(direct);
    if (u.hostname !== 'www.dropbox.com' && u.hostname !== 'dropbox.com') return direct;
    u.hostname = 'dl.dropboxusercontent.com';
    return u.toString();
  } catch {
    return direct;
  }
}
