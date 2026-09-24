import { z } from 'zod';
import { seedBills } from '@spendflow/shared/seed';
import { seedCashflow } from '@spendflow/shared/seed';
import type { Bill } from '@spendflow/shared/types';
import { tool } from 'ai';

export const aiTools: Record<string, any> = {
  listBills: tool({
    description: 'List bills matching the given criteria. Use this to find bills by status, vendor, or date.',
    parameters: z.object({
      status: z.array(z.string()).optional().describe('Filter by bill statuses, e.g., ["Pending Approval", "Paid", "Draft"]'),
      vendor: z.string().optional().describe('Filter by vendor name (partial match allowed)'),
    }),
    execute: async ({ status, vendor }: { status?: string[]; vendor?: string }) => {
      let results = seedBills;
      if (status && status.length > 0) {
        results = results.filter(b => status.includes(b.status));
      }
      if (vendor) {
        const vLower = vendor.toLowerCase();
        results = results.filter(b => b.vendorName.toLowerCase().includes(vLower));
      }
      return {
        count: results.length,
        bills: results.map(b => ({
          id: b.id,
          vendor: b.vendorName,
          amount: b.totalAmount,
          status: b.status,
          dueDate: b.dueDate
        })).slice(0, 50) // limit for context
      };
    }
  } as any),
  getApprovals: tool({
    description: 'Get all bills that are pending approval.',
    parameters: z.object({}),
    execute: async () => {
      const approvals = seedBills.filter(b => b.status === 'Pending Approval');
      return {
        count: approvals.length,
        bills: approvals.map(b => ({
          id: b.id,
          vendor: b.vendorName,
          amount: b.totalAmount,
          status: b.status,
          dueDate: b.dueDate
        }))
      };
    }
  } as any),
  getCashflow: tool({
    description: 'Get the current cashflow summary including net position and forecasts.',
    parameters: z.object({}),
    execute: async () => {
      const totalForecast = seedCashflow.reduce((acc, c) => acc + (c.forecast || 0), 0);
      const totalActual = seedCashflow.reduce((acc, c) => acc + (c.actual || 0), 0);
      return {
        totalForecast,
        totalActual,
        netCashflow: totalForecast - totalActual
      };
    }
  } as any),
  sumByCategory: tool({
    description: 'Calculate total spend for a specific category.',
    parameters: z.object({
      category: z.string().describe('The category to sum up, e.g., "Software", "Travel", "Office Supplies"')
    }),
    execute: async ({ category }: { category: string }) => {
      const billsInCat = seedBills.filter(b => b.category.toLowerCase() === category.toLowerCase());
      const total = billsInCat.reduce((acc, b) => acc + b.totalAmount, 0);
      return {
        category,
        count: billsInCat.length,
        totalSpend: total,
      };
    }
  } as any)
};
