import type { CashflowEntry } from '../types';

function generateCashflowData(): CashflowEntry[] {
  const entries: CashflowEntry[] = [];
  const today = new Date();

  for (let i = -15; i <= 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0]!;

    // Past days have actual values; future days have null actual
    const isHistory = i <= 0;
    const baseSpend = 150000 + Math.random() * 300000;
    const weekday = date.getDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.3 : 1;

    const forecast = Math.round(baseSpend * weekendFactor);
    const actual = isHistory
      ? Math.round(forecast * (0.8 + Math.random() * 0.4)) // ±20% variance
      : null;

    entries.push({ date: dateStr, actual, forecast });
  }

  return entries;
}

export const seedCashflow: CashflowEntry[] = generateCashflowData();
