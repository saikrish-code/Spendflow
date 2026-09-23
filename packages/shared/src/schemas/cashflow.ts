import { z } from 'zod';

export const CashflowEntrySchema = z.object({
  date: z.string(),
  actual: z.number().nullable(),
  forecast: z.number(),
});

export const CashflowResponseSchema = z.object({
  entries: z.array(CashflowEntrySchema),
  summary: z.object({
    totalActual: z.number(),
    totalForecast: z.number(),
    netCashflow: z.number(),
  }),
});
