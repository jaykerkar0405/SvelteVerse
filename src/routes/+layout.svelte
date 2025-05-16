<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { setAuth } from '$lib/hooks/use-auth';
	import { Toaster } from '$lib/components/ui/sonner';
	import UpdateSheet from '$lib/components/update-sheet.svelte';
	import { registerServiceWorker } from '$lib/utils/update-handler';

	let { data, children } = $props<{ data: { user: any } }>();

	setAuth(data.user);

	const fontUrls = ['/fonts/Inter-VariableFont_opsz,wght.ttf'];

	onMount(() => {
		registerServiceWorker();
	});
</script>

<svelte:head>
	{#each fontUrls as url}
		<link rel="preload" href={url} as="font" type="font/ttf" crossorigin="anonymous" />
	{/each}
</svelte:head>

<ModeWatcher />
<Toaster richColors position="bottom-right" />
<UpdateSheet />

{@render children?.()}
