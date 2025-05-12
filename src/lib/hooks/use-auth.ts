import { readable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { getContext, setContext } from 'svelte';

export type User = {
	id: string;
	email: string;
	name?: string;
	createdAt: Date;
	updatedAt: Date;
	image?: string | null;
	emailVerified: boolean;
};

export type AuthStore = Readable<{
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
}>;

const AUTH_CONTEXT_KEY = Symbol('auth');

export function createAuthStore(initialUser: User | null): AuthStore {
	return readable({
		isLoading: false,
		user: initialUser,
		isAuthenticated: !!initialUser
	});
}

export function setAuth(user: User | null): AuthStore {
	const store = createAuthStore(user);
	setContext(AUTH_CONTEXT_KEY, store);
	return store;
}

export function useAuth(): AuthStore {
	const store = getContext<AuthStore | undefined>(AUTH_CONTEXT_KEY);

	if (!store) {
		throw new Error(
			'Auth context not found. Make sure to call setAuth() in your root +layout.svelte'
		);
	}

	return store;
}
