<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { Github, LogIn } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';

	let email = '';
	let password = '';
	let loading = false;

	async function handleEmailLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;

		try {
			// Add your auth.signInWithEmailAndPassword() or similar here
			console.log('Email login:', email, password);
		} catch (error) {
			console.error('Login error:', error);
		} finally {
			loading = false;
		}
	}

	async function handleGoogleLogin() {
		loading = true;
		try {
			await authClient.signIn.social({
				provider: 'google'
			});
		} catch (error) {
			console.error('Google login error:', error);
		} finally {
			loading = false;
		}
	}

	async function handleGithubLogin() {
		loading = true;
		try {
			await authClient.signIn.social({
				provider: 'github'
			});
		} catch (error) {
			console.error('Github login error:', error);
		} finally {
			loading = false;
		}
	}
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form on:submit={handleEmailLogin} class="grid gap-4">
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					bind:value={email}
					placeholder="m@example.com"
					autocomplete="off"
					data-1p-ignore
					required
				/>
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
					<a href="/" class="ml-auto inline-block text-sm underline"> Forgot your password? </a>
				</div>
				<Input id="password" type="password" bind:value={password} required />
			</div>

			<Button type="submit" class="w-full" disabled={loading}>
				<LogIn class="mr-2 h-4 w-4" />
				{#if loading}Logging in...{:else}Login{/if}
			</Button>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-card px-2 text-muted-foreground">or</span>
				</div>
			</div>

			<Button variant="outline" class="w-full" onclick={handleGoogleLogin} disabled={loading}>
				<svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
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
				Login with Google
			</Button>
			<Button variant="outline" class="w-full" onclick={handleGithubLogin} disabled={loading}>
				<Github class="mr-2 h-4 w-4" />
				Login with GitHub
			</Button>
		</form>
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="/" class="underline"> Sign up </a>
		</div>
	</Card.Content>
</Card.Root>
