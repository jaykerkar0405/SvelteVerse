import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
	test('Redirects to auth if not logged in', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/auth/);
	});

	test('Dashboard content (requires login)', async ({ page }) => {
		await page.goto('/dashboard');
		if (page.url().includes('/auth')) return;
		await expect(page.getByRole('heading', { name: /hey/i })).toBeVisible();
		await expect(page.getByText(/components/i)).toBeVisible();
		await expect(page.getByText(/integrations/i)).toBeVisible();
		await expect(page.getByText(/documentation/i)).toBeVisible();
		await expect(page.getByText(/open source/i)).toBeVisible();
	});
});
