export type ArithmeticOperator = '+' | '−' | '×' | '÷';

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  rawResult: string;
  operator: ArithmeticOperator;
  createdAt: number;
}

export type NewHistoryEntry = Omit<HistoryEntry, 'id' | 'createdAt'>;

export type RootStackParamList = {
  Calculator: undefined;
  History: undefined;
};

