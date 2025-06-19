import { test, expect } from '@playwright/test';

const HOME_URL = '/';
const AUTH_URL = '/(app)/(unprotected)/auth';
const DASHBOARD_URL = '/(app)/(protected)/dashboard';

function getAuthUrl(baseURL: string) {
	return baseURL + '/auth';
}

test.describe('Authentication and Protected Routes', () => {
	test('Homepage should have navigation to auth', async ({ page, baseURL }) => {
		await page.goto(HOME_URL);
		const loginButton = page.locator('text=/login|sign in|auth/i').first();
		await expect(loginButton).toBeVisible();
		await loginButton.click();
		await expect(page).toHaveURL(/auth/);
	});

	test('Auth page should show Google and GitHub login buttons', async ({ page }) => {
		await page.goto('/auth');
		await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
	});

	test('Clicking login buttons should start OAuth flow (redirect)', async ({ page }) => {
		await page.goto('/auth');
		const googleBtn = page.getByRole('button', { name: /google/i });
		await googleBtn.click();
		await expect(page).toHaveURL(/accounts\.google\.com|google\.com/);
		await page.goto('/auth');
		const githubBtn = page.getByRole('button', { name: /github/i });
		await githubBtn.click();
		await expect(page).toHaveURL(/github\.com\/login/);
	});

	test('Protected route should redirect to auth if not logged in', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/auth/);
	});
});
