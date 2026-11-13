import React from 'react';
import { Platform, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export type ButtonVariant = 'digit' | 'utility' | 'clear' | 'operator' | 'equals';

interface CalculatorButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isActive?: boolean;
  span?: 1 | 2;
  height?: number;
  accessibilityLabel?: string;
  icon?: React.ReactNode;
}

const VARIANT_COLORS: Record<ButtonVariant, { bg: string; pressedBg: string; text: string; border?: string }> = {
  digit: {
    bg: colors.digitBg,
    pressedBg: colors.digitPressed,
    text: colors.textPrimary,
    border: colors.border,
  },
  utility: {
    bg: colors.utilityBg,
    pressedBg: colors.utilityPressed,
    text: colors.textPrimary,
    border: colors.border,
  },
  clear: {
    bg: colors.utilityBg,
    pressedBg: colors.utilityPressed,
    text: colors.danger,
    border: colors.border,
  },
  operator: {
    bg: colors.operatorBg,
    pressedBg: colors.operatorPressed,
    text: colors.textPrimary,
    border: colors.operatorBorder,
  },
  equals: {
    bg: colors.equalsBg,
    pressedBg: colors.equalsPressed,
    text: colors.textPrimary,
  },
};

export function CalculatorButton({
  label,
  onPress,
  variant = 'digit',
  isActive = false,
  span = 1,
  height = 66,
  accessibilityLabel,
  icon,
}: CalculatorButtonProps) {
  const palette = VARIANT_COLORS[variant];
  const baseBg = isActive ? colors.operatorActiveBg : palette.bg;
  const textColor = isActive ? colors.operatorActiveText : palette.text;
  const isWide = span === 2;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.button,
        {
          height,
          flex: span,
          backgroundColor: pressed && !isActive ? palette.pressedBg : baseBg,
          borderColor: palette.border ?? 'transparent',
          borderWidth: palette.border ? 1 : 0,
        },
        isWide && styles.wideButton,
        pressed && styles.pressed,
        Platform.OS === 'web' && (styles.webCursor as ViewStyle),
      ]}
    >
      {icon ?? (
        <Text
          selectable={false}
          style={[
            styles.label,
            variant === 'operator' || variant === 'equals' ? styles.operatorLabel : null,
            variant === 'utility' || variant === 'clear' ? styles.utilityLabel : null,
            { color: textColor },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideButton: {
    alignItems: 'flex-start',
    paddingLeft: 26,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  webCursor: {
    cursor: 'pointer',
  } as ViewStyle,
  label: {
    fontSize: 24,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  operatorLabel: {
    fontSize: 26,
    fontWeight: '500',
  },
  utilityLabel: {
    fontSize: 19,
    fontWeight: '700',
  },
});
