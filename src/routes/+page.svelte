<script lang="ts">
	import {
		Card,
		Tabs,
		Badge,
		Button,
		TabsList,
		CardTitle,
		Separator,
		CardFooter,
		CardHeader,
		TabsTrigger,
		CardContent,
		TabsContent,
		CardDescription
	} from '$lib/components/ui'
	import { onMount } from 'svelte';
	import { Moon, Sun, Github, Package, Book, Code, Layers, ExternalLink } from 'lucide-svelte';

	// Theme handling
	let systemTheme = $state('light');
	let theme = $state(localStorage.getItem('theme') || 'system');

	// Update the document class and localStorage when theme changes
	$effect(() => {
		if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}

		localStorage.setItem('theme', theme);
	});

	// Listen for system theme changes
	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		systemTheme = mediaQuery.matches ? 'dark' : 'light';

		const handler = (e: MediaQueryListEvent) => {
			systemTheme = e.matches ? 'dark' : 'light';
		};

		mediaQuery.addEventListener('change', handler);

		return () => {
			mediaQuery.removeEventListener('change', handler);
		};
	});

	// Component categories and packages
	const components = [
		{
			category: 'Core Components',
			items: [
				{
					name: 'Button',
					description: 'Interactive button component with multiple variants',
					status: 'Stable'
				},
				{ name: 'Card', description: 'Versatile card container component', status: 'Stable' },
				{
					name: 'Form',
					description: 'Form elements with validation support',
					status: 'In Progress'
				}
			]
		},
		{
			category: 'Layout',
			items: [
				{
					name: 'Container',
					description: 'Responsive container with customizable width',
					status: 'Stable'
				},
				{ name: 'Grid', description: 'Flexible grid layout system', status: 'In Progress' },
				{ name: 'Stack', description: 'Vertical or horizontal stacking layout', status: 'Planned' }
			]
		},
		{
			category: 'Data Display',
			items: [
				{
					name: 'Table',
					description: 'Data table with sorting and filtering',
					status: 'In Progress'
				},
				{
					name: 'DataGrid',
					description: 'Advanced data grid with virtual scrolling',
					status: 'Planned'
				},
				{ name: 'Charts', description: 'Various chart components', status: 'Planned' }
			]
		},
		{
			category: 'Integrations',
			items: [
				{ name: 'Auth', description: 'Authentication helpers and components', status: 'Planned' },
				{ name: 'API', description: 'Data fetching utilities', status: 'Planned' },
				{ name: 'Storage', description: 'Local and remote storage integrations', status: 'Planned' }
			]
		}
	];

	const features = [
		{
			title: 'Modern Runes API',
			description: 'Built with SvelteKit v5 runes for reactive state management',
			icon: Code
		},
		{
			title: 'Accessible Components',
			description: 'All components follow WAI-ARIA guidelines and are keyboard navigable',
			icon: Layers
		},
		{
			title: 'Theme Support',
			description: 'Dark and light mode with customizable color schemes',
			icon: Sun
		},
		{
			title: 'Fully Typed',
			description: 'Written in TypeScript for better developer experience',
			icon: Book
		}
	];
</script>

<svelte:head>
	<title>SvelteVerse - A universe of SvelteKit components and integrations</title>
	<meta
		name="description"
		content="A comprehensive library of SvelteKit components and integrations for modern web applications"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<!-- Navigation -->
	<header
		class="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur"
	>
		<div class="container flex h-16 items-center justify-between">
			<div class="flex items-center gap-2">
				<Layers class="h-6 w-6 text-primary" />
				<span class="text-xl font-bold">SvelteVerse</span>
			</div>

			<div class="flex items-center gap-4">
				<a
					href="https://github.com/Crew-object-Object/SvelteVerse"
					class="flex items-center gap-2"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Github class="h-5 w-5" />
					<span class="hidden md:inline">GitHub</span>
				</a>

				<Button
					variant="outline"
					size="icon"
					on:click={() => {
						theme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
					}}
				>
					{#if theme === 'dark' || (theme === 'system' && systemTheme === 'dark')}
						<Moon class="h-5 w-5" />
					{:else}
						<Sun class="h-5 w-5" />
					{/if}
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
		</div>
	</header>

	<main class="flex-1">
		<!-- Hero Section -->
		<section class="bg-primary/5 py-20 md:py-32">
			<div class="container flex flex-col items-center text-center">
				<Badge variant="outline" class="mb-4">Alpha Release</Badge>
				<h1 class="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
					A universe of SvelteKit components
				</h1>
				<p class="mb-8 max-w-2xl text-xl text-muted-foreground">
					Beautiful, accessible, and customizable components for building modern SvelteKit
					applications
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<Button size="lg">
						<Package class="mr-2 h-5 w-5" />
						Get Started
					</Button>
					<Button variant="outline" size="lg" asChild>
						<a
							href="https://github.com/Crew-object-Object/SvelteVerse"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Github class="mr-2 h-5 w-5" />
							View on GitHub
						</a>
					</Button>
				</div>
			</div>
		</section>

		<!-- Features Section -->
		<section class="container py-20">
			<h2 class="mb-12 text-center text-3xl font-bold">Features</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{#each features as feature}
					<div class="flex flex-col items-start rounded-lg border border-border bg-card p-6">
						<div class="mb-4 rounded-md bg-primary/10 p-2">
							{#if feature.icon}
								<feature.icon class="h-6 w-6 text-primary" />
							{/if}
						</div>
						<h3 class="mb-2 text-xl font-medium">{feature.title}</h3>
						<p class="text-muted-foreground">{feature.description}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Components Section -->
		<section class="bg-muted/40 py-20">
			<div class="container">
				<h2 class="mb-12 text-center text-3xl font-bold">Components</h2>

				<Tabs default="core-components" class="w-full">
					<TabsList class="mb-8 grid grid-cols-2 md:grid-cols-4">
						{#each components as category}
							<TabsTrigger value={category.category.toLowerCase().replace(' ', '-')}>
								{category.category}
							</TabsTrigger>
						{/each}
					</TabsList>

					{#each components as category}
						<TabsContent value={category.category.toLowerCase().replace(' ', '-')}>
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{#each category.items as component}
									<Card>
										<CardHeader>
											<div class="flex items-start justify-between">
												<CardTitle>{component.name}</CardTitle>
												<Badge
													variant={component.status === 'Stable'
														? 'default'
														: component.status === 'In Progress'
															? 'secondary'
															: 'outline'}
												>
													{component.status}
												</Badge>
											</div>
											<CardDescription>{component.description}</CardDescription>
										</CardHeader>
										<CardFooter>
											<Button
												variant="ghost"
												size="sm"
												disabled={component.status !== 'Stable'}
												class="flex items-center"
											>
												<ExternalLink class="mr-2 h-4 w-4" />
												View Component
											</Button>
										</CardFooter>
									</Card>
								{/each}
							</div>
						</TabsContent>
					{/each}
				</Tabs>
			</div>
		</section>

		<!-- Installation Section -->
		<section class="container py-20">
			<h2 class="mb-12 text-center text-3xl font-bold">Getting Started</h2>
			<div class="mx-auto max-w-3xl">
				<Card>
					<CardHeader>
						<CardTitle>Installation</CardTitle>
						<CardDescription>Get up and running with SvelteVerse in your project</CardDescription>
					</CardHeader>
					<CardContent>
						<pre class="overflow-x-auto rounded-md bg-muted p-4"><code
								>npm install @svelteverse/core</code
							></pre>
						<Separator class="my-6" />
						<h3 class="mb-3 text-lg font-medium">Import and use components</h3>
						<pre class="overflow-x-auto rounded-md bg-muted p-4"><code
								>import {'{'} Button {'}'} from '@svelteverse/core';
  
  // In your component
  &lt;Button variant="primary"&gt;Click me&lt;/Button&gt;</code
							></pre>
					</CardContent>
				</Card>
			</div>
		</section>

		<!-- Call to Action -->
		<section class="bg-primary py-20 text-primary-foreground">
			<div class="container text-center">
				<h2 class="mb-4 text-3xl font-bold">Join the SvelteVerse Community</h2>
				<p class="mx-auto mb-8 max-w-2xl text-lg">
					Contribute to our open-source library and help us create the best component ecosystem for
					SvelteKit
				</p>
				<Button variant="secondary" size="lg" asChild>
					<a
						href="https://github.com/Crew-object-Object/SvelteVerse"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Github class="mr-2 h-5 w-5" />
						Star on GitHub
					</a>
				</Button>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t border-border">
		<div class="container py-8 md:py-12">
			<div class="flex flex-col items-center justify-between gap-6 md:flex-row">
				<div class="flex items-center gap-2">
					<Layers class="h-5 w-5 text-primary" />
					<span class="font-medium">SvelteVerse</span>
				</div>

				<p class="text-sm text-muted-foreground">
					A universe of SvelteKit components and integrations
				</p>

				<div class="flex items-center gap-4">
					<a
						href="https://github.com/Crew-object-Object/SvelteVerse"
						class="text-muted-foreground hover:text-foreground"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Github class="h-5 w-5" />
						<span class="sr-only">GitHub</span>
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>
