import { test, expect } from '@playwright/test';

test('approve a bill flow', async ({ page }) => {
  // 1. Open Dashboard
  await page.goto('/dashboard');
  
  // Wait for network/hydration to settle by checking for the KPI cards
  await expect(page.locator('text=Payables Due This Week')).toBeVisible();

  // 2. Navigate to Approvals
  await page.click('text=Approvals');
  
  // Ensure we are on Approvals page
  await expect(page).toHaveURL(/.*approvals/);
  
  // 3. Approve a bill
  const approveButton = page.locator('button:has-text("Approve")').first();
  await expect(approveButton).toBeVisible();
  
  await approveButton.click();
  
  // Check for the toast notification
  await expect(page.locator('text=Bill approved')).toBeVisible();
  
  // 4. Navigate to Bills to verify
  await page.click('text=Bills');
  await expect(page).toHaveURL(/.*bills/);
  
  // Filter by approved
  const statusFilter = page.locator('button[role="combobox"][aria-label="Filter by status"]');
  await statusFilter.click();
  await page.locator('text=Approved').click();
  
  // Table should show approved bills
  await expect(page.locator('tbody tr')).not.toHaveCount(0);
});
