import { useEffect, useState } from 'react';

type Operator = '+' | '-' | '×' | '÷';

type HistoryItem = {
  expression: string;
  result: string;
};

const MAX_DIGITS = 12;

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Number.parseFloat(value.toPrecision(12));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 10 });
};

const calculate = (first: number, second: number, operator: Operator) => {
  switch (operator) {
    case '+':
      return first + second;
    case '-':
      return first - second;
    case '×':
      return first * second;
    case '÷':
      return second === 0 ? Number.NaN : first / second;
  }
};

function App() {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const clear = () => {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const inputDigit = (digit: string) => {
    if (display === 'Error') clear();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }
    if (display.replace(/[-.]/g, '').replace(/,/g, '').length >= MAX_DIGITS) return;
    setDisplay(display === '0' ? digit : display.replace(/,/g, '') + digit);
  };

  const inputDecimal = () => {
    if (display === 'Error') clear();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) setDisplay(`${display.replace(/,/g, '')}.`);
  };

  const toggleSign = () => {
    if (display === '0' || display === 'Error') return;
    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`);
  };

  const backspace = () => {
    if (waitingForOperand || display === 'Error') return;
    const next = display.replace(/,/g, '').slice(0, -1);
    setDisplay(next && next !== '-' ? next : '0');
  };

  const chooseOperator = (nextOperator: Operator) => {
    const inputValue = Number(display.replace(/,/g, ''));
    if (Number.isNaN(inputValue)) return;

    if (storedValue !== null && operator && !waitingForOperand) {
      const result = calculate(storedValue, inputValue, operator);
      setStoredValue(result);
      setDisplay(formatNumber(result));
      setExpression(`${formatNumber(result)} ${nextOperator}`);
    } else {
      setStoredValue(inputValue);
      setExpression(`${formatNumber(inputValue)} ${nextOperator}`);
    }
    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const equals = () => {
    if (storedValue === null || !operator || waitingForOperand) return;
    const inputValue = Number(display.replace(/,/g, ''));
    const result = calculate(storedValue, inputValue, operator);
    const resultText = formatNumber(result);
    const expressionText = `${formatNumber(storedValue)} ${operator} ${formatNumber(inputValue)}`;

    setDisplay(resultText);
    setHistory((items) => [{ expression: expressionText, result: resultText }, ...items].slice(0, 5));
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setExpression('');
  };

  const percent = () => {
    if (display === 'Error') return;
    const value = Number(display.replace(/,/g, '')) / 100;
    setDisplay(formatNumber(value));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    if (/\d/.test(key)) inputDigit(key);
    else if (key === '.') inputDecimal();
    else if (key === 'Enter' || key === '=') equals();
    else if (key === 'Escape') clear();
    else if (key === 'Backspace') backspace();
    else if (key === '%') percent();
    else if (['+', '-', '*', '/'].includes(key)) {
      const symbols: Record<string, Operator> = { '+': '+', '-': '-', '*': '×', '/': '÷' };
      chooseOperator(symbols[key]);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const button = (label: string, onClick: () => void, className = '') => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={`calculator-button ${className}`}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <main className="calculator-page">
      <div className="calculator-shell">
        <section className="calculator-card" aria-label="Calculator">
          <div className="calculator-header">
            <div>
              <p className="eyebrow">Quick calculations</p>
              <h1>Calculator</h1>
            </div>
            <div className="status-dot" aria-label="Ready" />
          </div>

          <div className="display-panel">
            <p className="expression" aria-live="polite">{expression || '\u00a0'}</p>
            <output className="display-value" aria-label="Calculator result">{display}</output>
          </div>

          <div className="keypad">
            {button('AC', clear, 'function-key')}
            {button('⌫', backspace, 'function-key')}
            {button('%', percent, 'function-key')}
            {button('÷', () => chooseOperator('÷'), 'operator-key')}
            {button('7', () => inputDigit('7'))}
            {button('8', () => inputDigit('8'))}
            {button('9', () => inputDigit('9'))}
            {button('×', () => chooseOperator('×'), 'operator-key')}
            {button('4', () => inputDigit('4'))}
            {button('5', () => inputDigit('5'))}
            {button('6', () => inputDigit('6'))}
            {button('-', () => chooseOperator('-'), 'operator-key')}
            {button('1', () => inputDigit('1'))}
            {button('2', () => inputDigit('2'))}
            {button('3', () => inputDigit('3'))}
            {button('+', () => chooseOperator('+'), 'operator-key')}
            {button('±', toggleSign, 'function-key')}
            {button('0', () => inputDigit('0'), 'zero-key')}
            {button('.', inputDecimal)}
            {button('=', equals, 'equals-key')}
          </div>

          <p className="keyboard-hint">Tip: use your keyboard for faster calculations</p>
        </section>

        <aside className="history-card">
          <div className="history-heading">
            <div>
              <p className="eyebrow">Your activity</p>
              <h2>Recent calculations</h2>
            </div>
            {history.length > 0 && (
              <button type="button" className="clear-history" onClick={() => setHistory([])}>
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="empty-history">
              <span className="empty-icon">=</span>
              <p>Your calculations will appear here.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <button
                  type="button"
                  className="history-item"
                  key={`${item.expression}-${index}`}
                  onClick={() => {
                    setDisplay(item.result);
                    setWaitingForOperand(true);
                  }}
                >
                  <span>{item.expression}</span>
                  <strong>{item.result}</strong>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

export default App;
