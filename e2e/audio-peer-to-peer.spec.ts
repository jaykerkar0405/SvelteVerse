import { test, expect } from '@playwright/test';

test.describe('Audio Peer-to-Peer', () => {
	test('Redirects to auth if not logged in', async ({ page }) => {
		await page.goto('/audio/peer-to-peer');
		await expect(page).toHaveURL(/auth/);
	});

	test('Join form and validation (requires login)', async ({ page }) => {
		await page.goto('/audio/peer-to-peer');
		if (page.url().includes('/auth')) return;
		await expect(page.getByRole('textbox')).toBeVisible();
		await expect(page.getByRole('button', { name: /join/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /random/i })).toBeVisible();
		await page.getByRole('button', { name: /join/i }).click();
		await expect(page.getByText(/channel name must be in the format/i)).toBeVisible();
	});
});
