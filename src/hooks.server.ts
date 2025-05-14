import { auth } from '$lib/auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { cachingConfig } from '$lib/config/caching';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const sessionHandler: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.user = session?.user ?? null;
	return resolve(event);
};

const betterAuthHandler: Handle = ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth });
};

const cachingHandler: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	if (event.url.pathname.startsWith('/assets/')) {
		response.headers.set(
			'Cache-Control',
			`public, max-age=${cachingConfig.assets.maxAge}, must-revalidate`
		);
	}

	if (event.url.pathname.startsWith('/api/')) {
		response.headers.set(
			'Cache-Control',
			`public, max-age=${cachingConfig.api.maxAge}, must-revalidate, no-cache`
		);

		response.headers.set('ETag', crypto.randomUUID());
	}

	return response;
};

export const handle = sequence(sessionHandler, betterAuthHandler, cachingHandler);
