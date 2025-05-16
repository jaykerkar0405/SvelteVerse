/// <reference lib="webworker" />

const CACHE_VERSION = 'v1';
declare const self: ServiceWorkerGlobalScope;
const CACHE_NAME = `svelteverse-${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
	'/',
	'/favicon.ico',
	'/manifest.json',
	'/fonts/Inter-VariableFont_opsz,wght.ttf'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS_TO_CACHE);
		})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				})
			);
		})
	);

	// Immediately take control of all clients
	event.waitUntil(self.clients.claim());
});

// Fetch event - cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	event.respondWith(
		caches.match(event.request).then((cached) => {
			const networked = fetch(event.request)
				.then((response) => {
					const cacheCopy = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, cacheCopy);
					});
					return response;
				})
				.catch(() => {
					return new Response('Network error');
				});

			return Promise.resolve(cached || networked);
		})
	);
});

// Message event - handle skip waiting
self.addEventListener('message', (event) => {
	if (event.data === 'skipWaiting') {
		self.skipWaiting();
	}
});

export {};
