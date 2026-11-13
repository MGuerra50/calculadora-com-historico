import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { CalculatorButton, type ButtonVariant } from '../components/CalculatorButton';
import { ScreenShell } from '../components/ScreenShell';
import { useHistory } from '../context/HistoryContext';
import { colors } from '../theme/colors';
import type { ArithmeticOperator, RootStackParamList } from '../types/calculator';
import {
  applyRecalledResult,
  createInitialCalculatorState,
  formatNumberForDisplay,
  pressBackspace,
  pressClear,
  pressDecimal,
  pressDigit,
  pressEquals,
  pressOperator,
  pressToggleSign,
  type CalculatorState,
} from '../utils/calculator';

type Props = NativeStackScreenProps<RootStackParamList, 'Calculator'>;

type KeyItem = {
  id: string;
  label: string;
  variant: ButtonVariant;
  span?: 1 | 2;
  accessibilityLabel?: string;
  action:
    | { type: 'clear' }
    | { type: 'backspace' }
    | { type: 'toggleSign' }
    | { type: 'decimal' }
    | { type: 'equals' }
    | { type: 'digit'; value: string }
    | { type: 'operator'; value: ArithmeticOperator };
};

const KEYPAD_ROWS: KeyItem[][] = [
  [
    { id: 'ac', label: 'AC', variant: 'clear', accessibilityLabel: 'Limpar tudo', action: { type: 'clear' } },
    { id: 'backspace', label: '⌫', variant: 'utility', accessibilityLabel: 'Apagar último dígito', action: { type: 'backspace' } },
    { id: 'sign', label: '±', variant: 'utility', accessibilityLabel: 'Inverter sinal', action: { type: 'toggleSign' } },
    { id: 'div', label: '÷', variant: 'operator', accessibilityLabel: 'Dividir', action: { type: 'operator', value: '÷' } },
  ],
  [
    { id: '7', label: '7', variant: 'digit', action: { type: 'digit', value: '7' } },
    { id: '8', label: '8', variant: 'digit', action: { type: 'digit', value: '8' } },
    { id: '9', label: '9', variant: 'digit', action: { type: 'digit', value: '9' } },
    { id: 'mul', label: '×', variant: 'operator', accessibilityLabel: 'Multiplicar', action: { type: 'operator', value: '×' } },
  ],
  [
    { id: '4', label: '4', variant: 'digit', action: { type: 'digit', value: '4' } },
    { id: '5', label: '5', variant: 'digit', action: { type: 'digit', value: '5' } },
    { id: '6', label: '6', variant: 'digit', action: { type: 'digit', value: '6' } },
    { id: 'sub', label: '−', variant: 'operator', accessibilityLabel: 'Subtrair', action: { type: 'operator', value: '−' } },
  ],
  [
    { id: '1', label: '1', variant: 'digit', action: { type: 'digit', value: '1' } },
    { id: '2', label: '2', variant: 'digit', action: { type: 'digit', value: '2' } },
    { id: '3', label: '3', variant: 'digit', action: { type: 'digit', value: '3' } },
    { id: 'add', label: '+', variant: 'operator', accessibilityLabel: 'Somar', action: { type: 'operator', value: '+' } },
  ],
  [
    { id: '0', label: '0', variant: 'digit', span: 2, action: { type: 'digit', value: '0' } },
    { id: 'dec', label: ',', variant: 'digit', accessibilityLabel: 'Vírgula decimal', action: { type: 'decimal' } },
    { id: 'eq', label: '=', variant: 'equals', accessibilityLabel: 'Calcular resultado', action: { type: 'equals' } },
  ],
];

function getDisplayFontSize(text: string, hasError: boolean): number {
  if (hasError) {
    return 24;
  }
  const len = text.length;
  if (len <= 8) return 48;
  if (len <= 11) return 38;
  if (len <= 14) return 30;
  return 26;
}

export function CalculatorScreen({ navigation }: Props) {
  const [calcState, setCalcState] = useState<CalculatorState>(createInitialCalculatorState);
  const { history, addHistoryEntry, pendingRecall, consumeRecall } = useHistory();
  const isFocused = useIsFocused();
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (!pendingRecall) {
      return;
    }
    setCalcState(applyRecalledResult(pendingRecall.rawResult));
    consumeRecall();
  }, [pendingRecall, consumeRecall]);

  const handleDigit = useCallback((digit: string) => {
    setCalcState((prev) => pressDigit(prev, digit));
  }, []);

  const handleDecimal = useCallback(() => {
    setCalcState((prev) => pressDecimal(prev));
  }, []);

  const handleToggleSign = useCallback(() => {
    setCalcState((prev) => pressToggleSign(prev));
  }, []);

  const handleBackspace = useCallback(() => {
    setCalcState((prev) => pressBackspace(prev));
  }, []);

  const handleClear = useCallback(() => {
    setCalcState(pressClear());
  }, []);

  const handleOperator = useCallback(
    (operator: ArithmeticOperator) => {
      setCalcState((prev) => {
        const transition = pressOperator(prev, operator);
        if (transition.historyItem) {
          addHistoryEntry(transition.historyItem);
        }
        return transition.state;
      });
    },
    [addHistoryEntry]
  );

  const handleEquals = useCallback(() => {
    setCalcState((prev) => {
      const transition = pressEquals(prev);
      if (transition.historyItem) {
        addHistoryEntry(transition.historyItem);
      }
      return transition.state;
    });
  }, [addHistoryEntry]);

  const handleKeyPress = useCallback(
    (item: KeyItem) => {
      switch (item.action.type) {
        case 'clear':
          handleClear();
          break;
        case 'backspace':
          handleBackspace();
          break;
        case 'toggleSign':
          handleToggleSign();
          break;
        case 'decimal':
          handleDecimal();
          break;
        case 'equals':
          handleEquals();
          break;
        case 'digit':
          handleDigit(item.action.value);
          break;
        case 'operator':
          handleOperator(item.action.value);
          break;
      }
    },
    [handleBackspace, handleClear, handleDecimal, handleDigit, handleEquals, handleOperator, handleToggleSign]
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || !isFocused || typeof window === 'undefined') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const { key } = event;

      if (/^[0-9]$/.test(key)) {
        handleDigit(key);
      } else if (key === '.' || key === ',') {
        handleDecimal();
      } else if (key === '+') {
        handleOperator('+');
      } else if (key === '-') {
        handleOperator('−');
      } else if (key === '*') {
        handleOperator('×');
      } else if (key === '/') {
        event.preventDefault();
        handleOperator('÷');
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        event.preventDefault();
        handleBackspace();
      } else if (key === 'Escape' || key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFocused, handleBackspace, handleClear, handleDecimal, handleDigit, handleEquals, handleOperator]);

  const formattedValue = formatNumberForDisplay(calcState.currentInput);
  const mainDisplayText = calcState.errorMessage ?? formattedValue;
  const displayFontSize = getDisplayFontSize(mainDisplayText, Boolean(calcState.errorMessage));

  const clampedHeight = Math.min(height, 860);
  const buttonHeight = Math.min(72, Math.max(50, Math.floor((clampedHeight - 290) / 5)));

  return (
    <ScreenShell>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Ionicons name="calculator-outline" size={22} color={colors.accent} />
            <Text style={styles.title}>Calculadora</Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('History')}
            accessibilityRole="button"
            accessibilityLabel={`Abrir histórico com ${history.length} operações`}
            style={({ pressed }) => [
              styles.historyButton,
              pressed && styles.historyButtonPressed,
              Platform.OS === 'web' && (styles.webCursor as ViewStyle),
            ]}
          >
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.historyButtonText}>Histórico</Text>
          </Pressable>
        </View>

        <View style={styles.displayCard}>
          <Text
            style={styles.expressionText}
            numberOfLines={1}
            ellipsizeMode="head"
            selectable={false}
          >
            {calcState.expressionPreview || ' '}
          </Text>

          <Text
            style={[
              styles.displayValue,
              { fontSize: displayFontSize },
              calcState.errorMessage ? styles.errorText : null,
            ]}
            numberOfLines={calcState.errorMessage ? 2 : 1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
            selectable
          >
            {mainDisplayText}
          </Text>

          {calcState.errorMessage ? (
            <Text style={styles.errorHint}>Toque em AC ou digite um número</Text>
          ) : null}
        </View>

        <View style={styles.keypad}>
          {KEYPAD_ROWS.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.keypadRow}>
              {row.map((item) => {
                const isActiveOperator =
                  item.action.type === 'operator' &&
                  calcState.operator === item.action.value &&
                  calcState.waitingForSecondOperand &&
                  !calcState.errorMessage;

                const icon =
                  item.action.type === 'backspace' ? (
                    <Ionicons name="backspace-outline" size={22} color={colors.textPrimary} />
                  ) : undefined;

                return (
                  <CalculatorButton
                    key={item.id}
                    label={item.label}
                    variant={item.variant}
                    span={item.span ?? 1}
                    height={buttonHeight}
                    isActive={isActiveOperator}
                    accessibilityLabel={item.accessibilityLabel}
                    icon={icon}
                    onPress={() => handleKeyPress(item)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    justifyContent: 'space-between',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 5,
  },
  historyButtonPressed: {
    backgroundColor: colors.cardPressed,
    transform: [{ scale: 0.97 }],
  },
  historyButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  displayCard: {
    flex: 1,
    minHeight: 112,
    backgroundColor: colors.card,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 8,
  },
  expressionText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    width: '100%',
    fontVariant: ['tabular-nums'],
  },
  displayValue: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'right',
    width: '100%',
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
  },
  errorHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  keypad: {
    gap: 9,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 9,
  },
  webCursor: {
    cursor: 'pointer',
  } as ViewStyle,
});
