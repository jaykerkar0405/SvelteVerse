<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.addEventListener('message', (event) => {
				if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
					toast.info('New version available!', {
						duration: Infinity,
						description: 'Refresh to see the latest updates.',
						action: {
							label: 'Update now',
							onClick: () => {
								if (navigator.serviceWorker.controller) {
									navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
								}

								setTimeout(() => window.location.reload(), 500);
							}
						}
					});
				}

				if (event.data && event.data.type === 'RECONNECTED') {
					toast.success("You're back online!", {
						duration: 5000,
						description: 'Content has been updated.'
					});

					if (window.location.pathname === '/offline') {
						window.location.href = '/';
					}
				}
			});

			function checkConnectionStatus() {
				if (navigator.serviceWorker.controller) {
					navigator.serviceWorker.controller.postMessage({
						type: 'CHECK_CONNECTION'
					});
				}
			}

			const intervalId = setInterval(checkConnectionStatus, 30000);

			return () => {
				clearInterval(intervalId);
			};
		}
	});
</script>
