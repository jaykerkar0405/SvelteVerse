<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import NavMain from '$lib/components/nav-main.svelte';
	import NavUser from '$lib/components/nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Mic, MonitorSpeaker, Utensils, Video } from 'lucide-svelte';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	const navItems = [
		{
			label: 'WebRTC',
			items: [
				{
					icon: Mic,
					title: 'Audio Room',
					items: [
						{
							title: 'Peer to Peer',
							url: '/webrtc/audio/peer-to-peer'
						}
					]
				},
				{
					icon: Video,
					title: 'Video Room',
					items: [
						{
							title: 'Peer to Peer',
							url: '/webrtc/video/peer-to-peer'
						}
					]
				},
				{
					title: 'AV Room',
					icon: MonitorSpeaker,
					items: [
						{
							title: 'Peer to Peer',
							url: '/webrtc/av/peer-to-peer'
						}
					]
				}
			]
		}
	];
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<a href="/dashboard">
			<Sidebar.MenuButton size="lg">
				<div class="flex aspect-square size-8 items-center justify-center">
					<img src="/logo.png" alt="Logo" class="rounded-lg" />
				</div>

				<div class="ml-1 grid flex-1 text-left text-sm leading-tight">
					<span class="truncate font-semibold">SvelteVerse</span>
					<span class="truncate text-xs">A universe of SvelteKit</span>
				</div>
			</Sidebar.MenuButton>
		</a>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each navItems as navItem}
			<NavMain label={navItem.label} items={navItem.items} />
		{/each}
	</Sidebar.Content>

	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
