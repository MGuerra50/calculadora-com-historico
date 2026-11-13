import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import type { HistoryEntry } from '../types/calculator';

interface HistoryItemCardProps {
  item: HistoryEntry;
  onSelect: (item: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

function formatHistoryTimestamp(timestampMs: number): string {
  const date = new Date(timestampMs);
  const now = new Date();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeText = `${hours}:${minutes}`;

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return `Hoje, ${timeText}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Ontem, ${timeText}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}, ${timeText}`;
}

export function HistoryItemCard({ item, onSelect, onDelete }: HistoryItemCardProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`Reutilizar resultado ${item.result} de ${item.expression}`}
        style={({ pressed }) => [
          styles.mainArea,
          pressed && styles.mainAreaPressed,
          Platform.OS === 'web' && (styles.webCursor as ViewStyle),
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.operatorPill}>
            <Text style={styles.operatorText}>{item.operator}</Text>
          </View>
          <Text style={styles.timestamp}>{formatHistoryTimestamp(item.createdAt)}</Text>
        </View>

        <Text style={styles.expression} numberOfLines={2}>
          {item.expression}
        </Text>
        <Text style={styles.result} numberOfLines={1}>
          = {item.result}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onDelete(item.id)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`Remover operação ${item.expression} do histórico`}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.deleteButtonPressed,
          Platform.OS === 'web' && (styles.webCursor as ViewStyle),
        ]}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  mainArea: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 12,
    gap: 6,
  },
  mainAreaPressed: {
    opacity: 0.78,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  operatorPill: {
    minWidth: 26,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 5,
    backgroundColor: colors.operatorBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorText: {
    color: colors.operatorBadgeText,
    fontSize: 13,
    fontWeight: '700',
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  expression: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  result: {
    color: colors.textPrimary,
    fontSize: 21,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  deleteButton: {
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.65,
  },
  webCursor: {
    cursor: 'pointer',
  } as ViewStyle,
});
