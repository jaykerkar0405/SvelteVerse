import { goto } from '$app/navigation';
import { authClient } from '$lib/auth-client';
import { setAuth } from '$lib/hooks/use-auth';

export async function signOut() {
	try {
		await authClient.signOut();
		setAuth(null);
		goto('/auth');
	} catch (error) {
		console.error('Error signing out:', error);
	}
}
