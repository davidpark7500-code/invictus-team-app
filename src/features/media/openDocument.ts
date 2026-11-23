import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Platform, Share } from 'react-native';

/**
 * Open a web link, or a PDF on iPhone and Android, in an in-app browser sheet
 * (a new tab on the web). Pass PDFs through `toDirectMediaUrl` first so the
 * sheet shows the file itself, not Dropbox's page; that relies on the file
 * name ending in ".pdf". On the web, PDFs show in the page (`PdfViewer`).
 */
export async function openDocument(url: string) {
  if (!url) return;
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener');
    return;
  }
  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: undefined,
  });
}

/** Native share sheet (Messages, Mail, AirDrop...). Falls back to copying the link on the web. */
export async function shareDocument(title: string, url: string) {
  if (!url) return;
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.share) {
      await nav.share({ title, url }).catch(() => {});
    } else {
      await nav?.clipboard?.writeText(url).catch(() => {});
    }
    return;
  }
  await Share.share(Platform.OS === 'ios' ? { title, url } : { title, message: `${title}\n${url}` });
}
