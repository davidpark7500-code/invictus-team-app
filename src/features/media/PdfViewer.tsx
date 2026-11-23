type Props = { url: string; title: string };

/**
 * iPhone and Android: PDFs open in the in-app browser sheet instead (see
 * `openDocument`), which shows the file itself with the system PDF viewer.
 */
export function PdfViewer(_props: Props) {
  return null;
}

/** Native opens PDFs in a sheet, so the detail screen keeps its buttons. */
export const showsPdfInline = false;
