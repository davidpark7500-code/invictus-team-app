import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { toDirectFileUrl, toDirectMediaUrl } from '@/features/media/dropbox';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

type Props = { url: string; title: string };
type PdfJs = typeof import('pdfjs-dist');

/**
 * Web: draws every page of the PDF inside the app, fitted to the screen width.
 *
 * An <iframe> of the PDF would be simpler, but iPhone Safari shows it at full
 * page width with the right side cut off. pdf.js is loaded at runtime from
 * /pdfjs/ (copied there by scripts/copy-pdfjs.mjs) so it never ships in the
 * iPhone or Android app. If it fails, the browser's own viewer is the fallback.
 */
export function PdfViewer({ url, title }: Props) {
  const { colors } = useTheme();
  const pagesRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const src = toDirectFileUrl(url);

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => Promise<void>) | undefined;
    setState('loading');

    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const task = pdfjs.getDocument({ url: src });
        destroy = () => task.destroy();
        const doc = await task.promise;
        const host = pagesRef.current;
        if (cancelled || !host) return;
        host.replaceChildren();
        const width = host.clientWidth - PAGE_GUTTER * 2;
        // Sharp on Retina screens without running out of canvas memory on long files.
        const density = Math.min(window.devicePixelRatio || 1, 2);

        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) * density });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          Object.assign(canvas.style, pageStyle);
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `${title}, page ${n} of ${doc.numPages}`);
          host.appendChild(canvas);
          await page.render({ canvas, viewport }).promise;
          if (n === 1 && !cancelled) setState('ready');
        }
      } catch {
        if (!cancelled) setState('failed');
      }
    })();

    return () => {
      cancelled = true;
      destroy?.().catch(() => {});
    };
  }, [src, title]);

  if (state === 'failed') {
    return (
      <View style={[styles.frame, { backgroundColor: colors.backgroundElevated }]}>
        {/* The www link shows inline; the download host makes Safari offer a download. */}
        <iframe src={toDirectMediaUrl(url)} title={title} style={fallbackStyle} />
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <div ref={pagesRef} style={scrollerStyle} />
      {state === 'loading' ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={colors.textSecondary} />
          <Text variant="footnote" color="textSecondary">
            Loading PDF…
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Web shows PDFs in the page, so the detail screen swaps in the viewer. */
export const showsPdfInline = true;

let pdfJsPromise: Promise<PdfJs> | undefined;

/** Loads pdf.js once from /pdfjs/. A plain import() would make Metro bundle it. */
function loadPdfJs(): Promise<PdfJs> {
  pdfJsPromise ??= (async () => {
    const base = `${window.location.origin}/pdfjs`;
    const importAtRuntime = new Function('u', 'return import(u)') as (u: string) => Promise<PdfJs>;
    const pdfjs = await importAtRuntime(`${base}/pdf.min.mjs`);
    pdfjs.GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.mjs`;
    return pdfjs;
  })().catch((error: unknown) => {
    pdfJsPromise = undefined;
    throw error;
  });
  return pdfJsPromise;
}

const PAGE_GUTTER = 12;

const scrollerStyle = {
  height: '100%',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  padding: PAGE_GUTTER,
  boxSizing: 'border-box',
} as const;

const pageStyle = {
  display: 'block',
  width: '100%',
  height: 'auto',
  marginBottom: `${PAGE_GUTTER}px`,
  background: '#fff',
  borderRadius: '6px',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
};

const fallbackStyle = { border: 0, width: '100%', height: '100%', display: 'block' } as const;

const styles = StyleSheet.create({
  frame: { flex: 1, overflow: 'hidden' },
  loading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});
