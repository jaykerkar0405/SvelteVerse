<script lang="ts">
	import { fade } from 'svelte/transition';
	import { useAuth } from '$lib/hooks/use-auth';
	import { toTitleCase } from '$lib/utils/text';
	import * as Card from '$lib/components/ui/card';
	import { Package, Code, Book, Grid2x2, Heart } from 'lucide-svelte';

	const auth = useAuth();
	const { user } = $derived($auth);
	const firstName = $derived(user ? toTitleCase(user.name!!.split(' ')[0]) : 'there');

	const stats = [
		{
			title: 'Components',
			value: '50+',
			description: 'Ready-to-use components',
			icon: Grid2x2
		},
		{
			title: 'Integrations',
			value: '10+',
			description: 'Popular services supported',
			icon: Package
		},
		{
			title: 'Documentation',
			value: '100%',
			description: 'Well documented components',
			icon: Book
		},
		{
			title: 'Open Source',
			value: 'MIT',
			description: 'Free and open source',
			icon: Heart
		}
	];
</script>

<div class="container mx-auto flex flex-col gap-4 p-8 md:gap-6" in:fade={{ duration: 300 }}>
	<div class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">👋 Hey {firstName}!</h1>
		<p class="text-muted-foreground">Welcome to SvelteVerse - Your hub for SvelteKit components.</p>
	</div>

	<div class="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
		{#each stats as stat}
			{@const Component = stat.icon}
			<Card.Root class="h-full">
				<Card.Header class="space-y-1">
					<Card.Title class="flex items-center gap-2">
						<Component class="h-4 w-4" />
						{stat.title}
					</Card.Title>
					<Card.Description>{stat.description}</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{stat.value}</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid gap-3 md:grid-cols-2 md:gap-4">
		<Card.Root class="overflow-hidden">
			<Card.Header>
				<Card.Title>Getting Started</Card.Title>
				<Card.Description>Clone and run the project locally</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-3">
					<div class="overflow-x-auto rounded-lg bg-muted/50 p-4">
						<code class="inline-block min-w-[300px] whitespace-nowrap text-sm">
							git clone https://github.com/jaykerkar0405/svelteverse.git
						</code>
					</div>
					<div class="overflow-x-auto rounded-lg bg-muted/50 p-4">
						<code class="inline-block min-w-[300px] whitespace-nowrap text-sm">
							cd svelteverse && pnpm install
						</code>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Latest Updates</Card.Title>
				<Card.Description>What's new in SvelteVerse</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex items-center gap-4">
					<Code class="h-5 w-5 shrink-0 text-primary" />
					<div class="space-y-1">
						<p class="text-sm font-medium">New Components Added</p>
						<p class="text-sm text-muted-foreground">Carousel, DatePicker, and more...</p>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<Package class="h-5 w-5 shrink-0 text-primary" />
					<div class="space-y-1">
						<p class="text-sm font-medium">Improved Documentation</p>
						<p class="text-sm text-muted-foreground">Better examples and usage guides</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
