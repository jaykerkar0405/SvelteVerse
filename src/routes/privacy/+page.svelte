<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft, Shield } from 'lucide-svelte';
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
				<Shield class="h-6 w-6 text-primary" />
				<Card.Title class="text-3xl font-bold tracking-tight">Privacy Policy</Card.Title>
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
					<h2 class="flex items-center gap-2">1. Information We Collect</h2>
					<p class="leading-relaxed">
						We collect information you provide directly to us when you create an account or use our
						services:
					</p>
					<ul class="list-inside list-disc space-y-2">
						<li>Email address and authentication details</li>
						<li>Profile information (name, avatar)</li>
						<li>Usage data and preferences</li>
						<li>Authentication data from social providers</li>
					</ul>
				</section>

				<section class="space-y-3">
					<h2>2. How We Use Your Information</h2>
					<p class="leading-relaxed">Your information helps us provide and improve our services:</p>
					<ul class="list-inside list-disc space-y-2">
						<li>Authenticate and maintain your account</li>
						<li>Provide personalized experiences</li>
						<li>Send important notifications</li>
						<li>Improve our platform and services</li>
					</ul>
				</section>

				<section class="space-y-3">
					<h2>3. Data Protection</h2>
					<p class="leading-relaxed">
						We implement industry-standard security measures to protect your data. All personal
						information is encrypted and stored securely. We regularly review our systems to ensure
						your data remains protected.
					</p>
				</section>

				<section class="space-y-3">
					<h2>4. Third-Party Services</h2>
					<p class="leading-relaxed">
						We use OAuth providers (Google, GitHub) for authentication. When you choose to use these
						services, their respective privacy policies will apply to the information they collect.
					</p>
				</section>

				<section class="space-y-3">
					<h2>5. Your Privacy Rights</h2>
					<p class="leading-relaxed">You have control over your personal data:</p>
					<ul class="list-inside list-disc space-y-2">
						<li>Request access to your personal information</li>
						<li>Update or correct your data</li>
						<li>Delete your account and associated data</li>
						<li>Opt-out of non-essential communications</li>
					</ul>
				</section>
			</div>
		</Card.Content>

		<Card.Footer class="flex items-center justify-between border-t bg-muted/50 px-8 py-6">
			<p class="text-sm text-muted-foreground">
				© {new Date().getFullYear()} SvelteVerse. All rights reserved.
			</p>
			<Button variant="outline" onclick={() => goto('/terms')} class="font-medium">
				Terms of Service
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
