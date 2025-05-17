<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Wifi, RefreshCw } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	function refreshPage() {
		window.location.reload();
	}
</script>

<div
	in:fade={{ duration: 300 }}
	class="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4"
>
	<Card.Root class="w-full max-w-md overflow-hidden">
		<Card.Header class="space-y-4 text-center">
			<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
				<Wifi class="h-10 w-10 text-primary" />
			</div>
			<Card.Title class="text-2xl font-bold">You're Offline</Card.Title>
			<Card.Description class="text-base">
				It looks like you lost your internet connection. Check your network and try again.
			</Card.Description>
		</Card.Header>

		<Card.Content class="space-y-4 pb-6 text-center">
			<div class="rounded-lg bg-muted/50 p-4">
				<p class="text-sm text-muted-foreground">
					Don't worry! Some features of SvelteVerse are still available offline.
				</p>
			</div>
		</Card.Content>

		<Card.Footer class="flex justify-center border-t bg-muted/50 p-6">
			<Button onclick={refreshPage} class="w-full max-w-xs">
				<RefreshCw class="mr-2 h-4 w-4" />
				Try Again
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
