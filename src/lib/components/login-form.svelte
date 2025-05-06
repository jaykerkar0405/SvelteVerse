<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import { authClient } from '$lib/auth-client';
	import * as Card from '$lib/components/ui/card';
	import { Github, Loader2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let loading = false;
	type Provider = 'google' | 'github';

	async function authenticate(provider: Provider) {
		if (loading) return;

		const toastId = toast.loading(
			`Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`
		);
		loading = true;

		try {
			await authClient.signIn.social({ provider, callbackURL: '/dashboard' });
			toast.dismiss(toastId);
			toast.success(`Connected with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`, {
				description: 'Redirecting...'
			});
		} catch (error: any) {
			toast.error('Authentication Failed', {
				description: error?.message || `Unable to connect with ${provider}. Please try again.`,
				id: toastId,
				action: {
					label: 'Try Again',
					onClick: () => authenticate(provider)
				}
			});
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-background px-4 py-12">
	<div class="w-full max-w-md" in:fade={{ duration: 300 }}>
		<Card.Root class="shadow-lg">
			<Card.Header class="space-y-2 text-center">
				<Card.Title class="text-2xl font-bold">Welcome to SvelteVerse</Card.Title>
				<Card.Description>Sign in or create an account to continue</Card.Description>
			</Card.Header>

			<Card.Content class="pb-8 pt-6">
				<div class="space-y-6">
					<Button
						{loading}
						variant="outline"
						onclick={() => authenticate('google')}
						class="relative h-12 w-full {loading ? 'opacity-80' : ''}"
					>
						<div class="flex w-full items-center justify-center space-x-2">
							<div class="w-5">
								{#if loading}
									<Loader2 class="h-4 w-4 animate-spin" />
								{:else}
									<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
										<path
											fill="#FFC107"
											d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
										/>
										<path
											fill="#FF3D00"
											d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
										/>
										<path
											fill="#4CAF50"
											d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
										/>
										<path
											fill="#1976D2"
											d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
										/>
									</svg>
								{/if}
							</div>
							<span class="w-[140px] text-center">
								{loading ? 'Connecting...' : 'Continue with Google'}
							</span>
						</div>
					</Button>

					<Button
						{loading}
						variant="outline"
						onclick={() => authenticate('github')}
						class="relative h-12 w-full {loading ? 'opacity-80' : ''}"
					>
						<div class="flex w-full items-center justify-center space-x-2">
							<div class="w-5">
								{#if loading}
									<Loader2 class="h-4 w-4 animate-spin" />
								{:else}
									<Github class="h-5 w-5" />
								{/if}
							</div>
							<span class="w-[140px] text-center">
								{loading ? 'Connecting...' : 'Continue with GitHub'}
							</span>
						</div>
					</Button>

					<p class="pt-2 text-center text-sm text-muted-foreground">
						We'll automatically create an account if you're new here
					</p>
				</div>
			</Card.Content>
		</Card.Root>

		<p class="mt-4 text-center text-xs text-muted-foreground">
			By continuing, you agree to our
			<a href="/terms" class="text-primary hover:underline">Terms</a> and
			<a href="/privacy" class="text-primary hover:underline">Privacy Policy</a>
		</p>
	</div>
</div>
