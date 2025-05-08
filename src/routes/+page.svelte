<script lang="ts">
	import {
		Sun,
		Moon,
		Code,
		Heart,
		Users,
		LogIn,
		Github,
		Package,
		ArrowUp,
		FileCode,
		ExternalLink,
		LayoutDashboard
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { toggleMode } from 'mode-watcher';
	import componentCategories from '$lib/data/home';
	import { Button } from '$lib/components/ui/button';

	let lastScrollY = 0;
	let { data } = $props();
	let activeCategory = $state(0);
	let user = $derived(data?.user);
	let isHeaderVisible = $state(true);
	let showScrollButton = $state(false);

	// Handle scroll event to show/hide header
	function handleScroll() {
		const scrollY = window.scrollY;

		lastScrollY = scrollY;
		showScrollButton = window.scrollY > 500;
		isHeaderVisible = scrollY < lastScrollY || scrollY < 50;
	}

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	// Scroll to section function
	function scrollToSection(sectionId: string) {
		const section = document.getElementById(sectionId);
		if (section) {
			section.scrollIntoView({ behavior: 'smooth' });
		}
	}

	// Set active category
	function setActiveCategory(index: number) {
		activeCategory = index;
	}
</script>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<!-- Header -->
	<header
		class:translate-y-0={isHeaderVisible}
		class:-translate-y-full={!isHeaderVisible}
		class="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur transition-all duration-200"
	>
		<div class="container flex h-16 items-center justify-between">
			<div class="flex items-center gap-2">
				<Package class="h-6 w-6 text-primary" />
				<a href="/" class="text-xl font-bold tracking-tight">SvelteVerse</a>
			</div>

			<nav class="hidden items-center gap-6 md:flex">
				<button
					onclick={() => scrollToSection('components')}
					class="text-muted-foreground transition hover:text-foreground"
				>
					Components
				</button>
				<button
					onclick={() => scrollToSection('about')}
					class="text-muted-foreground transition hover:text-foreground"
				>
					About
				</button>
				<button
					onclick={() => scrollToSection('contributing')}
					class="text-muted-foreground transition hover:text-foreground"
				>
					Contributing
				</button>
			</nav>

			<div class="flex items-center gap-4">
				<Button href={user ? '/dashboard' : '/auth'}>
					{#if user}
						<LayoutDashboard class="h-4 w-4" />
						<span class="ml-2 hidden md:inline">Dashboard</span>
					{:else}
						<LogIn class="h-4 w-4" />
						<span class="ml-2 hidden md:inline">Login</span>
					{/if}
				</Button>

				<Button onclick={toggleMode} variant="outline" size="icon">
					<Sun
						class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
		</div>
	</header>

	<main class="flex-1">
		<!-- Hero Section -->
		<section class="border-b border-border py-20 md:py-28 lg:py-32">
			<div class="container px-4 md:px-6">
				<div class="flex flex-col items-center justify-center space-y-4 text-center">
					<div class="space-y-2">
						<h1 class="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
							<span class="text-primary">Svelte</span>Verse
						</h1>
						<p class="max-w-[42rem] text-muted-foreground sm:text-xl">
							A simple and growing collection of plug-and-play SvelteKit components and
							integrations.
						</p>
					</div>
					<div class="flex flex-col items-center gap-4 sm:flex-row">
						<a
							href="https://github.com/Crew-object-Object/SvelteVerse"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
						>
							<Github class="mr-2 h-4 w-4" /> GitHub Repository
						</a>
						<button
							onclick={() => scrollToSection('components')}
							class="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							View Components
						</button>
					</div>
				</div>
			</div>
		</section>

		<section id="components" class="border-b border-border py-16 md:py-20">
			<div class="container px-4 md:px-6">
				<div class="mb-10 space-y-2">
					<h2 class="flex items-center text-3xl font-bold tracking-tight md:text-4xl">
						<FileCode class="mr-2 h-6 w-6 text-primary" /> Components
					</h2>
					<p class="text-muted-foreground">
						Easily integrate these components into your SvelteKit projects
					</p>
				</div>

				<!-- Component Categories Tabs -->
				<div class="mb-8">
					<div class="border-b border-border">
						<div class="scrollbar-none flex gap-1 overflow-x-auto pb-px">
							{#each componentCategories as category, i}
								{@const Component = category.icon}
								<button
									class="inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									class:border-primary={activeCategory === i}
									class:border-transparent={activeCategory !== i}
									class:text-foreground={activeCategory === i}
									class:text-muted-foreground={activeCategory !== i}
									class:hover:text-foreground={activeCategory !== i}
									onclick={() => setActiveCategory(i)}
								>
									<Component class="h-4 w-4" />
									{category.name}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Component Grid for Selected Category -->
				{#each componentCategories as category, categoryIndex}
					{#if activeCategory === categoryIndex}
						<div
							in:fade={{ duration: 300 }}
							class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
						>
							{#each category.components as component, i}
								<div
									in:fade={{ delay: 50 * i, duration: 200 }}
									class="group rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
								>
									<div class="mb-2 flex items-center justify-between">
										<h3 class="text-xl font-medium">{component.name}</h3>
										<a
											href={component.link}
											class="rounded-full p-2 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
										>
											<ExternalLink class="h-4 w-4" />
										</a>
									</div>
									<p class="text-sm text-muted-foreground">{component.description}</p>
								</div>
							{/each}
						</div>
					{/if}
				{/each}

				<div class="mt-10 text-center">
					<p class="italic text-muted-foreground">More components coming soon...</p>
				</div>
			</div>
		</section>

		<!-- Contributing Section -->
		<section id="contributing" class="border-b border-border py-16 md:py-20">
			<div class="container px-4 md:px-6">
				<div class="mb-8 space-y-2">
					<h2 class="flex items-center text-3xl font-bold tracking-tight md:text-4xl">
						<Code class="mr-2 h-6 w-6 text-primary" /> Contributing
					</h2>
					<p class="text-muted-foreground">Join our community and help us grow</p>
				</div>

				<div class="rounded-lg border border-border bg-card p-6 shadow md:p-8">
					<div class="space-y-4">
						<p>
							Contributions are welcome! If you have a component to share or an improvement to
							suggest, feel free to open a pull request or issue.
						</p>

						<div class="space-y-2">
							<p class="font-medium">Please:</p>
							<ul class="list-inside list-disc space-y-1 text-muted-foreground">
								<li>Follow the existing folder structure</li>
								<li>
									Include minimal setup instructions in a comment or <code>README</code> inside your
									component folder
								</li>
							</ul>
						</div>

						<div class="pt-4">
							<a
								href="https://github.com/Crew-object-Object/SvelteVerse"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
							>
								<Github class="mr-2 h-4 w-4" /> Contribute on GitHub
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- About Section -->
		<section id="about" class="py-16 md:py-20">
			<div class="container px-4 md:px-6">
				<div class="mb-8 space-y-2">
					<h2 class="flex items-center text-3xl font-bold tracking-tight md:text-4xl">
						<Users class="mr-2 h-6 w-6 text-primary" /> About
					</h2>
					<p class="text-muted-foreground">The story behind SvelteVerse</p>
				</div>

				<div class="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
					<div class="space-y-4">
						<p>
							SvelteVerse was created to provide the Svelte community with high-quality, accessible,
							and customizable components that can be easily integrated into any SvelteKit project.
						</p>
						<p>
							Our goal is to build a comprehensive library of components that follow best practices
							for accessibility, performance, and user experience.
						</p>
						<p>
							The project is open-source and licensed under the MIT License, allowing developers to
							freely use, modify, and distribute the components.
						</p>
					</div>

					<div class="rounded-lg border border-border bg-card p-6 shadow">
						<div class="space-y-4">
							<h3 class="text-xl font-semibold">Connect with the Creator</h3>
							<div class="flex items-center gap-4">
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
									<img
										alt="Creator"
										class="rounded-full border"
										src="https://avatars.githubusercontent.com/u/133675904?v=4"
									/>
								</div>
								<div>
									<p class="font-medium">Jay Kerkar</p>
									<p class="text-sm text-muted-foreground">
										Full Stack Web &amp; Mobile App Developer
									</p>
								</div>
							</div>
							<div class="flex gap-4 pt-2">
								<a
									href="https://github.com/jaykerkar0405"
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
								>
									<Github class="mr-2 h-4 w-4" /> GitHub
								</a>
								<a
									href="https://jaykerkar.vercel.app"
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
								>
									<ExternalLink class="mr-2 h-4 w-4" /> Portfolio
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t border-border bg-muted py-8">
		<div class="container px-4 md:px-6">
			<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
				<div class="flex items-center gap-2">
					<Package class="h-5 w-5 text-primary" />
					<a href="/" class="font-semibold">SvelteVerse</a>
				</div>

				<div class="flex items-center gap-1 text-sm text-muted-foreground">
					<span>Made with</span>
					<Heart class="h-4 w-4 fill-red-500 text-red-500" />
					<span>by Jay Kerkar</span>
				</div>

				<div class="flex gap-4">
					<a
						href="https://github.com/Crew-object-Object/SvelteVerse"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-full p-2 transition-colors hover:bg-background"
						aria-label="GitHub Repository"
					>
						<Github class="h-5 w-5" />
					</a>
				</div>
			</div>
		</div>
	</footer>

	{#if showScrollButton}
		<button
			onclick={scrollToTop}
			aria-label="Scroll to top"
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
			class="fixed bottom-6 right-6 z-40 rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
		>
			<ArrowUp class="h-5 w-5" />
		</button>
	{/if}
</div>
