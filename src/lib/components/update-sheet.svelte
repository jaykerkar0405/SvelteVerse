<script lang="ts">
	import { onMount } from 'svelte';
	import * as Sheet from '$lib/components/ui/sheet';

	export let open: boolean;
	export const registration: ServiceWorkerRegistration | null = null;

	onMount(() => {
		window.addEventListener('show-update-sheet', () => {
			open = true;
		});
	});

	function handleUpdate() {
		if (navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
		}
		open = false;
		window.location.reload();
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="bottom">
		<Sheet.Header>
			<Sheet.Title>Update Available</Sheet.Title>
			<Sheet.Description>
				A new version of the app is available. Would you like to update now?
			</Sheet.Description>
		</Sheet.Header>
		<div class="mt-6 flex justify-end space-x-4">
			<Sheet.Close class="rounded-md bg-secondary px-4 py-2 text-secondary-foreground">
				Remind Me Later
			</Sheet.Close>
			<button
				on:click={handleUpdate}
				class="rounded-md bg-primary px-4 py-2 text-primary-foreground"
			>
				Update Now
			</button>
		</div>
	</Sheet.Content>
</Sheet.Root>
