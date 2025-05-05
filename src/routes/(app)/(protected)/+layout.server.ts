import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = url.pathname.substring(1);
		throw redirect(303, `/auth?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return {
		user: locals.user
	};
};
