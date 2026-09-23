import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BillsDataTable } from '../app/bills/bills-data-table';
import { seedBills } from '@spendflow/shared/seed';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}));

describe('BillsDataTable Filters', () => {
  const onRowClick = vi.fn();
  const onRefresh = vi.fn();

  it('renders initial data correctly', () => {
    render(<BillsDataTable data={seedBills.slice(0, 10)} onRowClick={onRowClick} onRefresh={onRefresh} />);
    expect(screen.getByText('Nexus Digital Solutions')).toBeInTheDocument();
  });

  it('filters by status', async () => {
    const user = userEvent.setup();
    render(<BillsDataTable data={seedBills} onRowClick={onRowClick} onRefresh={onRefresh} />);
    
    // Open status filter dropdown
    const statusTrigger = screen.getByRole('combobox', { name: /filter by status/i });
    await user.click(statusTrigger);
    
    // Select "Approved"
    const approvedOption = screen.getByRole('option', { name: /approved/i });
    await user.click(approvedOption);
    
    // Check if only approved bills are shown
    const allBadges = screen.getAllByText('Approved');
    expect(allBadges.length).toBeGreaterThan(0);
    // Draft bills should not be visible
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
  });

  it('filters by search input', async () => {
    const user = userEvent.setup();
    render(<BillsDataTable data={seedBills} onRowClick={onRowClick} onRefresh={onRefresh} />);
    
    const searchInput = screen.getByRole('textbox', { name: /search bills/i });
    await user.type(searchInput, 'Nexus');
    
    expect(screen.getAllByText('Nexus Digital Solutions').length).toBeGreaterThan(0);
    expect(screen.queryByText('Pinnacle Office Supplies')).not.toBeInTheDocument();
  });
});
