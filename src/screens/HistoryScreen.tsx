import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { HistoryItemCard } from '../components/HistoryItemCard';
import { ScreenShell } from '../components/ScreenShell';
import { useHistory } from '../context/HistoryContext';
import { colors } from '../theme/colors';
import type { HistoryEntry, RootStackParamList } from '../types/calculator';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export function HistoryScreen({ navigation }: Props) {
  const { history, isLoading, removeHistoryEntry, clearHistory, requestRecall } = useHistory();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleSelectEntry = (item: HistoryEntry) => {
    requestRecall(item.rawResult);
    navigation.goBack();
  };

  const handleConfirmClear = () => {
    clearHistory();
    setConfirmVisible(false);
  };

  const countLabel =
    history.length === 1 ? '1 operação registrada' : `${history.length} operações registradas`;

  return (
    <ScreenShell>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a calculadora"
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.headerActionPressed,
              Platform.OS === 'web' && (styles.webCursor as ViewStyle),
            ]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>

          <Text style={styles.title}>Histórico</Text>

          {history.length > 0 ? (
            <Pressable
              onPress={() => setConfirmVisible(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Limpar todo o histórico"
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.headerActionPressed,
                Platform.OS === 'web' && (styles.webCursor as ViewStyle),
              ]}
            >
              <Text style={styles.clearButtonText}>Limpar</Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {history.length > 0 ? (
          <View style={styles.subHeader}>
            <Text style={styles.countText}>{countLabel}</Text>
            <Text style={styles.hintText}>Toque para reutilizar</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Carregando histórico...</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HistoryItemCard
                item={item}
                onSelect={handleSelectEntry}
                onDelete={removeHistoryEntry}
              />
            )}
            contentContainerStyle={
              history.length === 0 ? styles.emptyListContent : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrapper}>
                  <Ionicons name="time-outline" size={34} color={colors.accent} />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma operação registrada</Text>
                <Text style={styles.emptySubtitle}>
                  Realize somas, subtrações, multiplicações ou divisões na calculadora e o histórico aparecerá aqui automaticamente.
                </Text>
                <Pressable
                  onPress={() => navigation.goBack()}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar para a calculadora"
                  style={({ pressed }) => [
                    styles.emptyActionButton,
                    pressed && styles.emptyActionPressed,
                    Platform.OS === 'web' && (styles.webCursor as ViewStyle),
                  ]}
                >
                  <Ionicons name="calculator-outline" size={18} color={colors.textPrimary} />
                  <Text style={styles.emptyActionText}>Ir para a Calculadora</Text>
                </Pressable>
              </View>
            }
          />
        )}
      </View>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Limpar histórico?</Text>
            <Text style={styles.modalMessage}>
              Todas as {history.length} {history.length === 1 ? 'operação salva será removida' : 'operações salvas serão removidas'}. Essa ação não pode ser desfeita.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && styles.buttonPressed,
                  Platform.OS === 'web' && (styles.webCursor as ViewStyle),
                ]}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmClear}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.modalConfirmButton,
                  pressed && styles.modalConfirmPressed,
                  Platform.OS === 'web' && (styles.webCursor as ViewStyle),
                ]}
              >
                <Text style={styles.modalConfirmText}>Limpar tudo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 64,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  clearButton: {
    width: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  clearButtonText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 64,
  },
  headerActionPressed: {
    opacity: 0.65,
  },
  buttonPressed: {
    backgroundColor: colors.cardPressed,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  emptyIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 5,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyActionButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.equalsBg,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 5,
  },
  emptyActionPressed: {
    backgroundColor: colors.equalsPressed,
  },
  emptyActionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    gap: 12,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  modalMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelButton: {
    backgroundColor: colors.utilityBg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
  },
  modalCancelText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
  },
  modalConfirmPressed: {
    opacity: 0.85,
  },
  modalConfirmText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  webCursor: {
    cursor: 'pointer',
  } as ViewStyle,
});
