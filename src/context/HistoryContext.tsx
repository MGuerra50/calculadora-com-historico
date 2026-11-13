import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ArithmeticOperator, HistoryEntry, NewHistoryEntry } from '../types/calculator';

const STORAGE_KEY = '@calculadora_historico:entries_v1';
const MAX_HISTORY_ITEMS = 200;
const VALID_OPERATORS = new Set<ArithmeticOperator>(['+', '−', '×', '÷']);

interface RecallRequest {
  rawResult: string;
  token: number;
}

interface HistoryContextValue {
  history: HistoryEntry[];
  isLoading: boolean;
  pendingRecall: RecallRequest | null;
  addHistoryEntry: (entry: NewHistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  requestRecall: (rawResult: string) => void;
  consumeRecall: () => void;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

function isValidHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.expression === 'string' &&
    typeof candidate.result === 'string' &&
    typeof candidate.rawResult === 'string' &&
    typeof candidate.operator === 'string' &&
    VALID_OPERATORS.has(candidate.operator as ArithmeticOperator) &&
    typeof candidate.createdAt === 'number' &&
    Number.isFinite(candidate.createdAt)
  );
}

function generateEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRecall, setPendingRecall] = useState<RecallRequest | null>(null);
  const hasHydratedRef = useRef(false);
  const hasMutatedBeforeLoadRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!isMounted || hasMutatedBeforeLoadRef.current || !stored) {
          return;
        }

        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validEntries = parsed.filter(isValidHistoryEntry).slice(0, MAX_HISTORY_ITEMS);
          setHistory(validEntries);
        }
      } catch {
      } finally {
        if (isMounted) {
          hasHydratedRef.current = true;
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history)).catch(() => {});
  }, [history]);

  const addHistoryEntry = useCallback((entry: NewHistoryEntry) => {
    hasMutatedBeforeLoadRef.current = true;
    hasHydratedRef.current = true;

    const newEntry: HistoryEntry = {
      ...entry,
      id: generateEntryId(),
      createdAt: Date.now(),
    };

    setHistory((prev) => [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS));
  }, []);

  const removeHistoryEntry = useCallback((id: string) => {
    hasMutatedBeforeLoadRef.current = true;
    hasHydratedRef.current = true;
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    hasMutatedBeforeLoadRef.current = true;
    hasHydratedRef.current = true;
    setHistory([]);
  }, []);

  const requestRecall = useCallback((rawResult: string) => {
    setPendingRecall({ rawResult, token: Date.now() });
  }, []);

  const consumeRecall = useCallback(() => {
    setPendingRecall(null);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        history,
        isLoading,
        pendingRecall,
        addHistoryEntry,
        removeHistoryEntry,
        clearHistory,
        requestRecall,
        consumeRecall,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}

