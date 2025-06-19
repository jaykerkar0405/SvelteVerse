import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('Header and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('link', { name: /SvelteVerse/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /components/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /contributing/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /login|dashboard/i })).toBeVisible();
  });

  test('Scroll to section and scroll-to-top', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /components/i }).click();
    await expect(page.locator('#components')).toBeVisible();
    await page.getByRole('button', { name: /about/i }).click();
    await expect(page.locator('#about')).toBeVisible();
    await page.getByRole('button', { name: /contributing/i }).click();
    await expect(page.locator('#contributing')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole('button', { name: /scroll to top/i })).toBeVisible();
    await page.getByRole('button', { name: /scroll to top/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('Footer links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /GitHub Repository/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /SvelteVerse/i })).toBeVisible();
  });
}); 