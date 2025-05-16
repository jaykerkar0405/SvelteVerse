<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { setAuth } from '$lib/hooks/use-auth';
	import { Toaster } from '$lib/components/ui/sonner';
	import UpdateSheet from '$lib/components/update-sheet.svelte';

	let updateAvailable = $state(false);
	let { data, children } = $props<{ data: { user: any } }>();
	let registration = $state<ServiceWorkerRegistration | null>(null);

	setAuth(data.user);

	const fontUrls = ['/fonts/Inter-VariableFont_opsz,wght.ttf'];

	function showUpdateToast() {
		if (!updateAvailable) {
			updateAvailable = true;

			toast.info('Update Available', {
				duration: 10000,
				description: 'A new version of the app is available',
				onDismiss: () => (updateAvailable = false),
				action: {
					label: 'Update Now',
					onClick: () => {
						window.dispatchEvent(new CustomEvent('show-update-sheet'));
					}
				}
			});
		}
	}

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then((reg) => {
				registration = reg;
				reg.update();
			});

			// Listen for new service worker installation
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				// Only reload if we previously got an update
				if (updateAvailable) {
					window.location.reload();
				}
			});

			// Listen for update events
			window.addEventListener('load', () => {
				if (registration) {
					registration.addEventListener('updatefound', () => {
						const newWorker = registration?.installing;
						if (newWorker) {
							newWorker.addEventListener('statechange', () => {
								if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
									showUpdateToast();
								}
							});
						}
					});
				}
			});
		}
	});
</script>

<svelte:head>
	{#each fontUrls as url}
		<link rel="preload" href={url} as="font" type="font/ttf" crossorigin="anonymous" />
	{/each}
</svelte:head>

<ModeWatcher />
<Toaster richColors position="bottom-right" closeButton />
<UpdateSheet bind:open={updateAvailable} {registration} />

{@render children?.()}
