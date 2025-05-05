<script lang="ts">
	import { fade } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
</script>

<div
	class="flex min-h-screen items-center justify-center bg-background px-4"
	in:fade={{ duration: 300 }}
>
	<Card.Root class="max-w-lg text-center pb-4">
		<Card.Header class="space-y-2">
			<Card.Title class="text-3xl font-bold tracking-tight">Dashboard</Card.Title>
			<Card.Description class="text-base">
				Welcome to your SvelteVerse dashboard. This is where you'll find all your components and
				settings.
			</Card.Description>
		</Card.Header>
	</Card.Root>
</div>
