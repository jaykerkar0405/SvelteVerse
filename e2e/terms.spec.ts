import { test, expect } from '@playwright/test';

test.describe('Terms of Service', () => {
  test('Page content and navigation', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible();
    await expect(page.getByText(/last updated/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /privacy policy/i })).toBeVisible();
    await page.getByRole('button', { name: /privacy policy/i }).click();
    await expect(page).toHaveURL(/privacy/);
  });
}); 