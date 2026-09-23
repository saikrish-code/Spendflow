import { z } from 'zod';

export const BillStatus = z.enum([
  'Draft',
  'Pending Approval',
  'Approved',
  'Scheduled',
  'Paid',
  'Rejected',
]);

export const BillCategory = z.enum([
  'Software',
  'Office Supplies',
  'Marketing',
  'Travel',
  'Utilities',
  'Professional Services',
  'Hardware',
  'Telecommunications',
]);

export const LineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

export const BillSchema = z.object({
  id: z.string(),
  vendorName: z.string().min(1),
  vendorGstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GSTIN format',
  }),
  invoiceNumber: z.string().min(1),
  amount: z.number().positive(),
  gstAmount: z.number().nonnegative(),
  totalAmount: z.number().positive(),
  currency: z.literal('INR'),
  dueDate: z.string(), // ISO date string
  category: BillCategory,
  status: BillStatus,
  approver: z.string().min(1),
  lineItems: z.array(LineItemSchema),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
