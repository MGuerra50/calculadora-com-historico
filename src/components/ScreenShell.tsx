import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface ScreenShellProps {
  children: React.ReactNode;
}

export function ScreenShell({ children }: ScreenShellProps) {
  const { width, height } = useWindowDimensions();
  const isWideViewport = width >= 540;
  const useCardFrame = isWideViewport && height >= 620;

  return (
    <SafeAreaView style={styles.outer} edges={['top', 'bottom', 'left', 'right']}>
      <View
        style={[
          styles.inner,
          isWideViewport && styles.innerWide,
          useCardFrame && styles.innerFramed,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.appSurface,
  },
  innerWide: {
    maxWidth: 460,
  },
  innerFramed: {
    maxHeight: 860,
    marginVertical: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});

