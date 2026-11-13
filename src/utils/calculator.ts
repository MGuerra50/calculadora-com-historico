import type { ArithmeticOperator, NewHistoryEntry } from '../types/calculator';

export interface CalculatorState {
  currentInput: string;
  firstOperand: string | null;
  operator: ArithmeticOperator | null;
  waitingForSecondOperand: boolean;
  justEvaluated: boolean;
  lastOperator: ArithmeticOperator | null;
  lastOperand: string | null;
  expressionPreview: string;
  errorMessage: string | null;
}

export interface CalculatorTransition {
  state: CalculatorState;
  historyItem?: NewHistoryEntry;
}

const MAX_INPUT_DIGITS = 14;

export function createInitialCalculatorState(): CalculatorState {
  return {
    currentInput: '0',
    firstOperand: null,
    operator: null,
    waitingForSecondOperand: false,
    justEvaluated: false,
    lastOperator: null,
    lastOperand: null,
    expressionPreview: '',
    errorMessage: null,
  };
}

export function normalizeRawNumber(raw: string): string {
  if (!raw || raw === '-' || raw === '-0' || raw === '-0.') {
    return '0';
  }

  if (raw.includes('e') || raw.includes('E')) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed !== 0 ? numberToRawString(parsed) : '0';
  }

  const isNegative = raw.startsWith('-');
  const unsigned = isNegative ? raw.slice(1) : raw;
  const [rawInt = '0', rawDec] = unsigned.split('.');

  const trimmedInt = rawInt.replace(/^0+(?=\d)/, '') || '0';
  const trimmedDec = rawDec ? rawDec.replace(/0+$/, '') : '';

  if (trimmedInt === '0' && !trimmedDec) {
    return '0';
  }

  const sign = isNegative ? '-' : '';
  return trimmedDec ? `${sign}${trimmedInt}.${trimmedDec}` : `${sign}${trimmedInt}`;
}

export function numberToRawString(value: number): string {
  if (value === 0 || Object.is(value, -0)) {
    return '0';
  }

  const cleaned = Number(value.toPrecision(12));
  if (cleaned === 0 || Object.is(cleaned, -0)) {
    return '0';
  }

  const abs = Math.abs(cleaned);
  if (abs >= 1e12 || abs < 1e-9) {
    return cleaned.toExponential(6).replace(/(\.\d*?[1-9])0+(e)/, '$1$2').replace(/\.0+(e)/, '$1');
  }

  if (abs < 1e-6) {
    return cleaned.toFixed(11).replace(/\.?0+$/, '');
  }

  return String(cleaned);
}

export function formatNumberForDisplay(raw: string): string {
  if (!raw) {
    return '0';
  }

  if (raw.includes('e') || raw.includes('E')) {
    return raw.replace('.', ',');
  }

  const isNegative = raw.startsWith('-');
  const unsigned = isNegative ? raw.slice(1) : raw;
  const hasDot = unsigned.includes('.');
  const [intPart = '0', decPart = ''] = unsigned.split('.');

  const formattedInt = (intPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = isNegative ? '-' : '';

  if (hasDot) {
    return `${sign}${formattedInt},${decPart}`;
  }

  return `${sign}${formattedInt}`;
}

export function calculateOperation(
  left: number,
  right: number,
  operator: ArithmeticOperator
): { ok: true; value: number } | { ok: false; error: string } {
  let result: number;

  switch (operator) {
    case '+':
      result = left + right;
      break;
    case '−':
      result = left - right;
      break;
    case '×':
      result = left * right;
      break;
    case '÷':
      if (right === 0) {
        return { ok: false, error: 'Não é possível dividir por zero' };
      }
      result = left / right;
      break;
  }

  if (!Number.isFinite(result)) {
    return { ok: false, error: 'Resultado fora do limite' };
  }

  return { ok: true, value: result === 0 ? 0 : result };
}

function countDigits(raw: string): number {
  return raw.replace(/[^0-9]/g, '').length;
}

function evaluatePair(
  leftRaw: string,
  rightRaw: string,
  operator: ArithmeticOperator
):
  | { ok: true; rawResult: string; expression: string; displayResult: string }
  | { ok: false; error: string; expression: string } {
  const left = Number(leftRaw);
  const right = Number(rightRaw);
  const expression = `${formatNumberForDisplay(leftRaw)} ${operator} ${formatNumberForDisplay(rightRaw)}`;
  const outcome = calculateOperation(left, right, operator);

  if (!outcome.ok) {
    return { ok: false, error: outcome.error, expression };
  }

  const rawResult = numberToRawString(outcome.value);
  return {
    ok: true,
    rawResult,
    expression,
    displayResult: formatNumberForDisplay(rawResult),
  };
}

export function pressDigit(state: CalculatorState, digit: string): CalculatorState {
  if (!/^[0-9]$/.test(digit)) {
    return state;
  }

  if (state.errorMessage || state.justEvaluated) {
    return {
      ...createInitialCalculatorState(),
      currentInput: digit,
    };
  }

  if (state.waitingForSecondOperand) {
    return {
      ...state,
      currentInput: digit,
      waitingForSecondOperand: false,
    };
  }

  if (state.currentInput === '0') {
    return { ...state, currentInput: digit };
  }

  if (state.currentInput === '-0') {
    return { ...state, currentInput: `-${digit}` };
  }

  if (countDigits(state.currentInput) >= MAX_INPUT_DIGITS) {
    return state;
  }

  return {
    ...state,
    currentInput: `${state.currentInput}${digit}`,
  };
}

export function pressDecimal(state: CalculatorState): CalculatorState {
  if (state.errorMessage || state.justEvaluated) {
    return {
      ...createInitialCalculatorState(),
      currentInput: '0.',
    };
  }

  if (state.waitingForSecondOperand) {
    return {
      ...state,
      currentInput: '0.',
      waitingForSecondOperand: false,
    };
  }

  if (state.currentInput.includes('.')) {
    return state;
  }

  return {
    ...state,
    currentInput: `${state.currentInput}.`,
  };
}

export function pressToggleSign(state: CalculatorState): CalculatorState {
  if (state.errorMessage) {
    return state;
  }

  const base = state.justEvaluated
    ? createInitialCalculatorState()
    : state;

  if (normalizeRawNumber(state.currentInput) === '0' && !state.currentInput.includes('.')) {
    return state.justEvaluated
      ? { ...base, currentInput: '0' }
      : state;
  }

  const toggled = state.currentInput.startsWith('-')
    ? state.currentInput.slice(1)
    : `-${state.currentInput}`;

  return {
    ...base,
    currentInput: toggled,
    waitingForSecondOperand: false,
    firstOperand: state.justEvaluated ? null : state.firstOperand,
    operator: state.justEvaluated ? null : state.operator,
    expressionPreview: state.justEvaluated ? '' : state.expressionPreview,
  };
}

export function pressBackspace(state: CalculatorState): CalculatorState {
  if (state.errorMessage) {
    return createInitialCalculatorState();
  }

  if (state.waitingForSecondOperand) {
    return state;
  }

  if (state.currentInput.includes('e') || state.currentInput.includes('E')) {
    return state.justEvaluated
      ? createInitialCalculatorState()
      : { ...state, currentInput: '0' };
  }

  const nextInput = state.currentInput.length > 1
    ? state.currentInput.slice(0, -1)
    : '0';

  const sanitized = nextInput === '-' ? '0' : nextInput;

  if (state.justEvaluated) {
    return {
      ...createInitialCalculatorState(),
      currentInput: sanitized,
    };
  }

  return {
    ...state,
    currentInput: sanitized,
  };
}

export function pressClear(): CalculatorState {
  return createInitialCalculatorState();
}

export function pressOperator(
  state: CalculatorState,
  nextOperator: ArithmeticOperator
): CalculatorTransition {
  if (state.errorMessage) {
    return { state };
  }

  if (
    state.firstOperand !== null &&
    state.operator !== null &&
    !state.waitingForSecondOperand &&
    !state.justEvaluated
  ) {
    const rightRaw = normalizeRawNumber(state.currentInput);
    const evaluated = evaluatePair(state.firstOperand, rightRaw, state.operator);

    if (!evaluated.ok) {
      return {
        state: {
          ...createInitialCalculatorState(),
          expressionPreview: evaluated.expression,
          errorMessage: evaluated.error,
        },
      };
    }

    return {
      state: {
        currentInput: evaluated.rawResult,
        firstOperand: evaluated.rawResult,
        operator: nextOperator,
        waitingForSecondOperand: true,
        justEvaluated: false,
        lastOperator: null,
        lastOperand: null,
        expressionPreview: `${evaluated.displayResult} ${nextOperator}`,
        errorMessage: null,
      },
      historyItem: {
        expression: evaluated.expression,
        result: evaluated.displayResult,
        rawResult: evaluated.rawResult,
        operator: state.operator,
      },
    };
  }

  const leftRaw =
    state.waitingForSecondOperand && state.firstOperand !== null
      ? state.firstOperand
      : normalizeRawNumber(state.currentInput);

  return {
    state: {
      currentInput: leftRaw,
      firstOperand: leftRaw,
      operator: nextOperator,
      waitingForSecondOperand: true,
      justEvaluated: false,
      lastOperator: null,
      lastOperand: null,
      expressionPreview: `${formatNumberForDisplay(leftRaw)} ${nextOperator}`,
      errorMessage: null,
    },
  };
}

export function pressEquals(state: CalculatorState): CalculatorTransition {
  if (state.errorMessage) {
    return { state };
  }

  if (state.firstOperand !== null && state.operator !== null) {
    const leftRaw = state.firstOperand;
    const rightRaw = normalizeRawNumber(state.currentInput);
    const evaluated = evaluatePair(leftRaw, rightRaw, state.operator);

    if (!evaluated.ok) {
      return {
        state: {
          ...createInitialCalculatorState(),
          expressionPreview: evaluated.expression,
          errorMessage: evaluated.error,
        },
      };
    }

    return {
      state: {
        currentInput: evaluated.rawResult,
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
        justEvaluated: true,
        lastOperator: state.operator,
        lastOperand: rightRaw,
        expressionPreview: `${evaluated.expression} =`,
        errorMessage: null,
      },
      historyItem: {
        expression: evaluated.expression,
        result: evaluated.displayResult,
        rawResult: evaluated.rawResult,
        operator: state.operator,
      },
    };
  }

  if (state.justEvaluated && state.lastOperator !== null && state.lastOperand !== null) {
    const leftRaw = normalizeRawNumber(state.currentInput);
    const rightRaw = state.lastOperand;
    const evaluated = evaluatePair(leftRaw, rightRaw, state.lastOperator);

    if (!evaluated.ok) {
      return {
        state: {
          ...createInitialCalculatorState(),
          expressionPreview: evaluated.expression,
          errorMessage: evaluated.error,
        },
      };
    }

    return {
      state: {
        currentInput: evaluated.rawResult,
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
        justEvaluated: true,
        lastOperator: state.lastOperator,
        lastOperand: rightRaw,
        expressionPreview: `${evaluated.expression} =`,
        errorMessage: null,
      },
      historyItem: {
        expression: evaluated.expression,
        result: evaluated.displayResult,
        rawResult: evaluated.rawResult,
        operator: state.lastOperator,
      },
    };
  }

  return { state };
}

export function applyRecalledResult(rawResult: string): CalculatorState {
  const normalized = normalizeRawNumber(rawResult);
  return {
    ...createInitialCalculatorState(),
    currentInput: normalized,
    justEvaluated: true,
    expressionPreview: 'Resultado do histórico',
  };
}

