import { z } from 'zod';
import {
  BillSchema,
  BillStatus,
  BillCategory,
  LineItemSchema,
  ApprovalSchema,
  ApprovalAction,
  ApprovalRequestSchema,
  ReimbursementSchema,
  ReimbursementStatus,
  ReimbursementCategory,
  ReimbursementCreateSchema,
  CashflowEntrySchema,
  CashflowResponseSchema,
} from '../schemas';

export type Bill = z.infer<typeof BillSchema>;
export type BillStatusType = z.infer<typeof BillStatus>;
export type BillCategoryType = z.infer<typeof BillCategory>;
export type LineItem = z.infer<typeof LineItemSchema>;

export type Approval = z.infer<typeof ApprovalSchema>;
export type ApprovalActionType = z.infer<typeof ApprovalAction>;
export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export type Reimbursement = z.infer<typeof ReimbursementSchema>;
export type ReimbursementStatusType = z.infer<typeof ReimbursementStatus>;
export type ReimbursementCategoryType = z.infer<typeof ReimbursementCategory>;
export type ReimbursementCreate = z.infer<typeof ReimbursementCreateSchema>;

export type CashflowEntry = z.infer<typeof CashflowEntrySchema>;
export type CashflowResponse = z.infer<typeof CashflowResponseSchema>;

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
