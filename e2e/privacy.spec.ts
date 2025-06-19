import { test, expect } from '@playwright/test';

test.describe('Privacy Policy', () => {
  test('Page content and navigation', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
    await expect(page.getByText(/last updated/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /terms of service/i })).toBeVisible();
    await page.getByRole('button', { name: /terms of service/i }).click();
    await expect(page).toHaveURL(/terms/);
  });
}); 