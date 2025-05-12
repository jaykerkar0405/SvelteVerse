import { auth } from '$lib/auth';
import { setAuth } from '$lib/hooks/use-auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
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

export const handle = sequence(sessionHandler, betterAuthHandler);
