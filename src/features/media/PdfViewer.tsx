import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Text } from '@/components/ui/Text';
import { toDirectMediaUrl } from '@/features/media/dropbox';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

type Props = { url: string; title: string };

/**
 * iPhone and Android: the PDF fills the screen inside the app, drawn by the
 * system's own PDF viewer (pinch to zoom, smooth scrolling), under the screen's
 * title bar with its Share button. Dropbox files go through `toDirectMediaUrl`
 * so the file itself shows, not Dropbox's page.
 */
export function PdfViewer({ url, title }: Props) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={styles.center}>
        <Text variant="body" color="textSecondary" style={styles.message}>
          {`Couldn't open "${title}". Check your connection and try again.`}
        </Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: toDirectMediaUrl(url) }}
      style={[styles.web, { backgroundColor: colors.background }]}
      // Keeps the first page clear of the title bar and the last clear of the tab bar.
      contentInsetAdjustmentBehavior="automatic"
      originWhitelist={['https://*']}
      startInLoadingState
      renderLoading={() => (
        <View style={[styles.center, StyleSheet.absoluteFill]}>
          <ActivityIndicator color={colors.textSecondary} />
          <Text variant="footnote" color="textSecondary">
            Loading PDF…
          </Text>
        </View>
      )}
      onError={() => setFailed(true)}
      onHttpError={() => setFailed(true)}
      accessibilityLabel={title}
    />
  );
}

/** Both web and native show PDFs in the screen, so the detail screen swaps in the viewer. */
export const showsPdfInline = true;

const styles = StyleSheet.create({
  web: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  message: { textAlign: 'center' },
});
