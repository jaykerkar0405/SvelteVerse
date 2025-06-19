import { test, expect } from '@playwright/test';

test.describe('Offline Page', () => {
  test('Offline message and try again', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.getByRole('heading', { name: /offline/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
  });
}); 