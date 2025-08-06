<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />

	<div class="flex h-screen w-full flex-col">
		<header
			class="flex h-12 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm"
		>
			<div class="flex items-center gap-2">
				<Sidebar.Trigger />
				<Separator orientation="vertical" class="mr-2 h-6" />
				<Breadcrumbs />
			</div>

			<Button variant="outline" size="icon" class="h-8" onclick={toggleMode}>
				<Sun
					class="size-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute size-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</header>

		<ScrollArea class="h-[calc(100vh-3rem)]">
			<main class="flex w-full flex-col gap-4">
				{@render children?.()}
			</main>
		</ScrollArea>
	</div>
</Sidebar.Provider>
