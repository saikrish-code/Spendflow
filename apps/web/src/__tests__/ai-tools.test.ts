import { expect, test, describe } from 'vitest';
import { aiTools } from '../lib/ai/tools';

describe('AI Tools', () => {
  test('listBills filters by status', async () => {
    const result = await aiTools.listBills.execute({ status: ['Draft'] }, { toolCallId: '1', messages: [] });
    expect(result.count).toBeGreaterThan(0);
    // All returned bills should have 'Draft' status
    result.bills.forEach((b: any) => expect(b.status).toBe('Draft'));
  });

  test('getApprovals returns only Pending Approval', async () => {
    const result = await aiTools.getApprovals.execute({}, { toolCallId: '2', messages: [] });
    expect(result.count).toBeGreaterThan(0);
    result.bills.forEach((b: any) => expect(b.status).toBe('Pending Approval'));
  });

  test('getCashflow returns valid numbers', async () => {
    const result = await aiTools.getCashflow.execute({}, { toolCallId: '3', messages: [] });
    expect(typeof result.totalForecast).toBe('number');
    expect(typeof result.totalActual).toBe('number');
    expect(typeof result.netCashflow).toBe('number');
  });

  test('sumByCategory returns correct sum', async () => {
    const result = await aiTools.sumByCategory.execute({ category: 'Software' }, { toolCallId: '4', messages: [] });
    expect(result.category).toBe('Software');
    expect(result.totalSpend).toBeGreaterThan(0);
  });
});
