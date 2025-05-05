<script lang="ts">
	import { goto } from '$app/navigation';
	import { Scroll } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { ArrowLeft } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="container mx-auto max-w-3xl px-4 py-12" in:fade={{ duration: 300 }}>
	<Button variant="ghost" class="mb-8" onclick={() => goto('/')}>
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back
	</Button>

	<Card.Root class="overflow-hidden shadow-lg">
		<Card.Header class="space-y-3 border-b bg-muted/50 pb-6">
			<div class="flex items-center gap-2">
				<Scroll class="h-6 w-6 text-primary" />
				<Card.Title class="text-3xl font-bold tracking-tight">Terms of Service</Card.Title>
			</div>
			<Card.Description class="text-base">
				Last updated: {new Date().toLocaleDateString()}
			</Card.Description>
		</Card.Header>

		<Card.Content
			class="prose prose-slate dark:prose-invert prose-headings:font-semibold prose-h2:text-xl prose-h2:text-primary/80 prose-p:text-muted-foreground prose-li:text-muted-foreground max-w-none px-8 py-8"
		>
			<div class="space-y-8">
				<section class="space-y-3">
					<h2 class="flex items-center gap-2">1. Acceptance of Terms</h2>
					<p class="leading-relaxed">
						By accessing and using SvelteVerse, you accept and agree to be bound by the terms and
						conditions outlined here.
					</p>
				</section>

				<section class="space-y-3">
					<h2>2. User Account</h2>
					<p class="leading-relaxed">
						You are responsible for maintaining the security of your account and password.
						SvelteVerse cannot and will not be liable for any loss or damage from your failure to
						comply with this security obligation.
					</p>
				</section>

				<section class="space-y-3">
					<h2>3. Services</h2>
					<p class="leading-relaxed">
						SvelteVerse provides a platform for developers to access and use reusable Svelte
						components. We reserve the right to modify or discontinue any service at any time.
					</p>
				</section>

				<section class="space-y-3">
					<h2>4. Intellectual Property</h2>
					<p class="leading-relaxed">
						The components available through SvelteVerse are provided under the MIT License unless
						otherwise specified. You retain all rights to your own implementations.
					</p>
				</section>

				<section class="space-y-3">
					<h2>5. Limitations</h2>
					<p class="leading-relaxed">
						In no event shall SvelteVerse be liable for any damages arising out of the use or
						inability to use our services.
					</p>
				</section>
			</div>
		</Card.Content>

		<Card.Footer class="flex items-center justify-between border-t bg-muted/50 px-8 py-6">
			<p class="text-sm text-muted-foreground">
				© {new Date().getFullYear()} SvelteVerse. All rights reserved.
			</p>
			<Button variant="outline" onclick={() => goto('/privacy')} class="font-medium">
				Privacy Policy
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
