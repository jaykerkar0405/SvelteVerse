<script lang="ts">
	import { Github, Chrome } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" placeholder="m@example.com" required />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
					<a href="/" class="ml-auto inline-block text-sm underline"> Forgot your password? </a>
				</div>
				<Input id="password" type="password" required />
			</div>
			<Button type="submit" class="w-full">Login</Button>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-card px-2 text-muted-foreground">or</span>
				</div>
			</div>

			<Button variant="outline" class="w-full">
				<Chrome class="mr-2 h-4 w-4" />
				Login with Google
			</Button>
			<Button variant="outline" class="w-full">
				<Github class="mr-2 h-4 w-4" />
				Login with GitHub
			</Button>
		</div>
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="/" class="underline"> Sign up </a>
		</div>
	</Card.Content>
</Card.Root>
