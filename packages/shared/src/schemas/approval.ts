import { z } from 'zod';

export const ApprovalAction = z.enum(['Approved', 'Rejected']);

export const ApprovalSchema = z.object({
  id: z.string(),
  billId: z.string(),
  approverId: z.string(),
  approverName: z.string(),
  action: ApprovalAction,
  reason: z.string().optional(),
  timestamp: z.string(),
});

export const ApprovalRequestSchema = z.object({
  billId: z.string().min(1),
  action: ApprovalAction,
  reason: z.string().optional(),
}).refine(
  (data) => data.action === 'Approved' || (data.action === 'Rejected' && data.reason && data.reason.length > 0),
  {
    message: 'Reason is required when rejecting a bill',
    path: ['reason'],
  }
);
