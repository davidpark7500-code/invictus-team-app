import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Platform, Share } from 'react-native';

/**
 * Open a PDF or web link inside the app (an in-app browser sheet on iPhone and
 * Android; a new tab on the web). Dropbox share links open Dropbox's document
 * viewer, which renders PDFs even when the file has no ".pdf" extension.
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
