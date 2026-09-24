import { test, expect } from '@playwright/test';

test('copilot flow opens, answers, and citation opens bill sheet', async ({ page }) => {
  // 1. Open Dashboard
  await page.goto('/dashboard');
  
  // 2. Open Command Bar with Cmd/Ctrl + K
  // We use keyboard shortcut
  await page.keyboard.press('Meta+k');
  
  // Fallback for Windows/Linux where Meta is Windows key, maybe Ctrl+K is better
  // Just in case, try Ctrl+K if it didn't open
  if (!(await page.locator('text=Ask AI Copilot').isVisible())) {
    await page.keyboard.press('Control+k');
  }

  // 3. Click Ask AI Copilot
  await page.click('text=Ask AI Copilot');
  
  // Wait for the Chat Panel to open
  await expect(page.locator('text=SpendFlow Copilot')).toBeVisible();

  // 4. Ask a question via the suggested prompt
  await page.click('text=What is my largest pending approval?');
  
  // Click send button
  await page.click('button:has(svg.lucide-send)');
  
  // 5. Wait for the mock provider to stream the answer containing [BILL-0020]
  // In the UI it's rendered as a Badge with text BILL-0020
  const citationBadge = page.locator('div.text-primary.bg-primary\\/10', { hasText: 'BILL-0020' });
  
  // Wait for the stream to finish and badge to appear
  await expect(citationBadge).toBeVisible({ timeout: 10000 });

  // 6. Click the citation
  await citationBadge.click();

  // 7. Verify the Bill Details sheet opens
  // The sheet will add ?billId=BILL-0020 to URL and show "Bill Details"
  await expect(page).toHaveURL(/.*billId=BILL-0020/);
  await expect(page.locator('h2:has-text("Bill Details")')).toBeVisible();
});
