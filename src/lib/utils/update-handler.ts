import { toast } from 'svelte-sonner';

let registration: ServiceWorkerRegistration | undefined;

export async function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		try {
			registration = await navigator.serviceWorker.register('/service-worker.js', {
				type: 'module',
				scope: '/'
			});

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
		} catch (error) {
			console.error('Service worker registration failed:', error);
		}
	}
}

function showUpdateToast() {
	toast('Update Available', {
		description: 'A new version of the app is available',
		action: {
			label: 'View',
			onClick: () => {
				const event = new CustomEvent('show-update-sheet');
				window.dispatchEvent(event);
			}
		}
	});
}

export function applyUpdate() {
	if (registration?.waiting) {
		registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		window.location.reload();
	}
}
