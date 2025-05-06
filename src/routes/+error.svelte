<script lang="ts">
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, CircleOff } from 'lucide-svelte';
</script>

<div
	in:fade={{ duration: 300 }}
	class="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4"
>
	<div class="w-full max-w-md space-y-8">
		<Card.Root class="overflow-hidden">
			<Card.Header class="space-y-4 text-center">
				<div
					in:fly={{ y: -20, duration: 400, delay: 150 }}
					class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted"
				>
					<CircleOff class="h-10 w-10 text-muted-foreground" />
				</div>

				<div class="space-y-2">
					<Card.Title class="text-3xl font-bold">
						<div in:fly={{ y: 20, duration: 400, delay: 200 }}>
							{$page.status || 500}
						</div>
					</Card.Title>

					<div in:fly={{ y: 20, duration: 400, delay: 250 }}>
						<Card.Description class="text-base text-muted-foreground">
							{$page.error?.message || 'Something went wrong. Please try again later.'}
						</Card.Description>
					</div>
				</div>
			</Card.Header>

			<Card.Content class="pb-6 pt-2">
				<div class="flex justify-center" in:fly={{ y: 20, duration: 400, delay: 350 }}>
					<Button onclick={() => history.back()} variant="outline" class="gap-2">
						<ArrowLeft class="h-4 w-4" />
						Go Back
					</Button>
				</div>
			</Card.Content>

			<Card.Footer class="border-t bg-muted/50 p-6 text-center">
				<p class="text-sm text-muted-foreground" in:fly={{ y: 20, duration: 400, delay: 400 }}>
					If this error persists, please contact support or <a
						target="_blank"
						rel="noopener noreferrer"
						href="https://github.com/Crew-object-Object/SvelteVerse/issues"
						class="text-primary underline-offset-4 hover:underline">report an issue</a
					>
				</p>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
