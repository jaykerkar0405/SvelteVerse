<script lang="ts">
	import { Github, Chrome } from 'lucide-svelte';
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
			// Add your auth.signInWithGoogle() or similar here
			console.log('Google login clicked');
		} catch (error) {
			console.error('Google login error:', error);
		} finally {
			loading = false;
		}
	}

	async function handleGithubLogin() {
		loading = true;
		try {
			// Add your auth.signInWithGithub() or similar here
			console.log('Github login clicked');
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
				<Input id="email" type="email" bind:value={email} placeholder="m@example.com" required />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
					<a href="/" class="ml-auto inline-block text-sm underline"> Forgot your password? </a>
				</div>
				<Input id="password" type="password" bind:value={password} required />
			</div>

			<Button type="submit" class="w-full" disabled={loading}>
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
				<Chrome class="mr-2 h-4 w-4" />
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
