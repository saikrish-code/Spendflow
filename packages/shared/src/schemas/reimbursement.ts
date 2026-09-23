import { z } from 'zod';

export const ReimbursementStatus = z.enum(['Pending', 'Approved', 'Rejected', 'Paid']);

export const ReimbursementCategory = z.enum([
  'Travel',
  'Meals',
  'Office Supplies',
  'Software',
  'Training',
  'Equipment',
  'Other',
]);

export const ReimbursementSchema = z.object({
  id: z.string(),
  employeeName: z.string().min(1),
  employeeEmail: z.string().email(),
  amount: z.number().positive(),
  currency: z.literal('INR'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: ReimbursementCategory,
  receiptUrl: z.string().optional(),
  status: ReimbursementStatus,
  submittedAt: z.string(),
  reviewedAt: z.string().optional(),
  reviewerName: z.string().optional(),
});

export const ReimbursementCreateSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeEmail: z.string().email('Valid email is required'),
  amount: z.number().positive('Amount must be greater than 0').max(1000000, 'Amount cannot exceed ₹10,00,000'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: ReimbursementCategory,
  receiptUrl: z.string().optional(),
});
