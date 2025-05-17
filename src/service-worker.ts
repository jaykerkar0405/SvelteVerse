/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

let isOnline = true;
const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files, '/offline'];

const sw = self as unknown as ServiceWorkerGlobalScope;

// Cache all assets during installation
sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			await cache.addAll(ASSETS);
		})()
	);
});

// Clean up old caches when activating
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			await sw.clients.claim();
			const keys = await caches.keys();

			await Promise.all(
				keys
					.filter((key) => key !== CACHE)
					.map((key) => {
						return caches.delete(key);
					})
			);
		})()
	);
});

// Helper function to check network connection
async function checkConnectivity() {
	try {
		const response = await fetch('/');
		const newOnlineStatus = response.ok;

		if (!isOnline && newOnlineStatus) {
			const clients = await sw.clients.matchAll();
			clients.forEach((client) => {
				client.postMessage({ type: 'RECONNECTED' });
			});
		}

		isOnline = newOnlineStatus;
		return isOnline;
	} catch (err) {
		isOnline = false;
		return false;
	}
}

// Stale-while-revalidate strategy for fetch events
sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET' || event.request.headers.has('range')) {
		return;
	}

	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) {
		return;
	}

	if (url.pathname.startsWith('/api/')) {
		event.respondWith(
			fetch(event.request).catch(async (err) => {
				const cachedResponse = await caches.match(event.request);
				isOnline = false;
				return cachedResponse || new Response('Network error', { status: 408 });
			})
		);

		return;
	}

	if (event.request.mode === 'navigate') {
		event.respondWith(
			(async () => {
				try {
					const networkResponse = await fetch(event.request);
					isOnline = true;

					const cache = await caches.open(CACHE);
					cache.put(event.request, networkResponse.clone());

					return networkResponse;
				} catch (err) {
					isOnline = false;
					const cachedResponse = await caches.match(event.request);
					if (cachedResponse) return cachedResponse;

					const offlinePage = await caches.match('/offline');
					if (offlinePage) return offlinePage;

					return new Response('Service Unavailable', { status: 503 });
				}
			})()
		);
		return;
	}

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			const cachedResponse = await cache.match(event.request);

			if (cachedResponse) {
				(async () => {
					try {
						const networkResponse = await fetch(event.request);
						isOnline = true;
						await cache.put(event.request, networkResponse.clone());
					} catch (err) {
						isOnline = false;
						console.log('Background refresh failed', err);
					}
				})();

				return cachedResponse;
			}

			try {
				const networkResponse = await fetch(event.request);
				isOnline = true;

				if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
					await cache.put(event.request, networkResponse.clone());
				}

				return networkResponse;
			} catch (err) {
				isOnline = false;
				return new Response('Network error', { status: 408 });
			}
		})()
	);
});

// Handle messages from clients
sw.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		sw.skipWaiting();
		console.log('Skip waiting, updating service worker immediately');
	}

	if (event.data && event.data.type === 'CHECK_CONNECTION') {
		checkConnectivity();
	}
});

// Periodic checks for updates (useful for long-lived browser sessions)
setInterval(
	() => {
		(async () => {
			try {
				if (!navigator.onLine) return;

				const response = await fetch('/version.json');
				if (response.ok) {
					const data = await response.json();

					if (data.version !== version) {
						const clients = await sw.clients.matchAll();
						clients.forEach((client) => {
							client.postMessage({
								type: 'UPDATE_AVAILABLE'
							});
						});
					}
				}
			} catch (err) {
				console.log('Version check failed', err);
			}
		})();
	},
	60 * 60 * 1000
);
