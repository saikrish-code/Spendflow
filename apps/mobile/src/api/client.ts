import type { Bill, Approval, CashflowResponse, Reimbursement } from '@spendflow/shared/types';
import { Platform } from 'react-native';

// For local testing on a physical device, this should be set to your computer's local IP address
// e.g., EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
const API_BASE = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000');

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  console.log(`Fetching ${url}...`);
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  getBills: () => fetcher<{ data: Bill[], total: number }>('/bills'),
  getBill: (id: string) => fetcher<{ data: Bill }>(`/bills?id=${id}`).then(res => res.data), // Mock since API doesn't support get by ID yet, wait actually /bills returns all.
  getApprovals: () => fetcher<{ data: Bill[] }>('/approvals'),
  approveBill: (billId: string) => fetcher<{ success: boolean }>('/approvals', {
    method: 'POST',
    body: JSON.stringify({ billId, action: 'Approve' })
  }),
  rejectBill: (billId: string, reason: string) => fetcher<{ success: boolean }>('/approvals', {
    method: 'POST',
    body: JSON.stringify({ billId, action: 'Reject', reason })
  }),
  getCashflow: () => fetcher<CashflowResponse>('/cashflow'),
  createReimbursement: (data: any) => fetcher<{ data: Reimbursement }>('/reimbursements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};
