<script lang="ts">
	import { Mic } from 'lucide-svelte';
	import type { ComponentProps } from 'svelte';
	import NavMain from '$lib/components/nav-main.svelte';
	import NavUser from '$lib/components/nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';

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
					title: 'Audio',
					items: [
						{
							url: '',
							title: 'peer 2 peer'
						},
						{
							url: '',
							title: 'multi peer'
						}
					]
				}
			]
		}
	];
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<Sidebar.MenuButton size="lg">
			<div class="flex aspect-square size-8 items-center justify-center">
				<img src="/logo.png" alt="Logo" class="rounded-lg" />
			</div>

			<div class="ml-1 grid flex-1 text-left text-sm leading-tight">
				<span class="truncate font-semibold">SvelteVerse</span>
				<span class="truncate text-xs">A universe of SvelteKit</span>
			</div>
		</Sidebar.MenuButton>
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
