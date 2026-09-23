import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReimbursementsPage from '../app/reimbursements/page';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/hooks/use-fetch', () => ({
  useFetch: () => ({ data: { data: [], total: 0 }, error: null, isLoading: false, refetch: vi.fn() })
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}));

describe('Reimbursement Form Validation', () => {
  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<ReimbursementsPage />);
    
    const submitBtn = screen.getByRole('button', { name: /submit claim/i });
    await user.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Employee name is required')).toBeInTheDocument();
      expect(screen.getByText('Valid email is required')).toBeInTheDocument();
      expect(screen.getByText('Expected number, received nan')).toBeInTheDocument();
    });
  });

  it('validates minimum amount correctly', async () => {
    const user = userEvent.setup();
    render(<ReimbursementsPage />);
    
    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, '-10');
    
    const submitBtn = screen.getByRole('button', { name: /submit claim/i });
    await user.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    });
  });
});
