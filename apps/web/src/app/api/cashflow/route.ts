import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { simulateLatency, shouldSimulateError } from '@/lib/utils';

export async function GET() {
  await simulateLatency();

  if (shouldSimulateError()) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Simulated API failure', statusCode: 500 },
      { status: 500 }
    );
  }

  const entries = store.cashflow;
  const totalActual = entries.reduce((sum, e) => sum + (e.actual ?? 0), 0);
  const totalForecast = entries.reduce((sum, e) => sum + e.forecast, 0);

  return NextResponse.json({
    entries,
    summary: {
      totalActual,
      totalForecast,
      netCashflow: totalActual - totalForecast,
    },
  });
}
