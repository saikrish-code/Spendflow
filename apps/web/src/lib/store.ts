import type { Bill, Approval, Reimbursement, CashflowEntry } from '@spendflow/shared/types';
import { seedBills } from '@spendflow/shared/seed';
import { seedApprovals } from '@spendflow/shared/seed';
import { seedReimbursements } from '@spendflow/shared/seed';
import { seedCashflow } from '@spendflow/shared/seed';

// In-memory store — reset on server restart
class Store {
  bills: Bill[];
  approvals: Approval[];
  reimbursements: Reimbursement[];
  cashflow: CashflowEntry[];

  constructor() {
    this.bills = [...seedBills];
    this.approvals = [...seedApprovals];
    this.reimbursements = [...seedReimbursements];
    this.cashflow = [...seedCashflow];
  }

  getBills(params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    let filtered = [...this.bills];

    if (params?.status) {
      const statuses = params.status.split(',');
      filtered = filtered.filter((b) => statuses.includes(b.status));
    }

    if (params?.category) {
      const categories = params.category.split(',');
      filtered = filtered.filter((b) => categories.includes(b.category));
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.vendorName.toLowerCase().includes(search) ||
          b.invoiceNumber.toLowerCase().includes(search) ||
          b.id.toLowerCase().includes(search)
      );
    }

    // Sort
    if (params?.sortBy) {
      const order = params.sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy as keyof Bill];
        const bVal = b[params.sortBy as keyof Bill];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * order;
        }
        return String(aVal).localeCompare(String(bVal)) * order;
      });
    }

    const total = filtered.length;
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return { data: paged, total, page, pageSize };
  }

  updateBillStatus(billId: string, status: Bill['status']): Bill | null {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) return null;
    bill.status = status;
    bill.updatedAt = new Date().toISOString();
    return bill;
  }

  getPendingApprovals(approverName?: string) {
    const pendingBills = this.bills.filter((b) => b.status === 'Pending Approval');
    if (approverName) {
      return pendingBills.filter((b) => b.approver === approverName);
    }
    return pendingBills;
  }

  addApproval(approval: Approval) {
    this.approvals.push(approval);
  }

  addReimbursement(reimbursement: Reimbursement) {
    this.reimbursements.push(reimbursement);
  }
}

// Singleton
export const store = new Store();
