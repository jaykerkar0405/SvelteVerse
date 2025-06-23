<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let {
		items,
		label
	}: {
		label: string;
		items: {
			icon: any;
			url?: string;
			title: string;
			isActive?: boolean;
			items?: {
				url: string;
				title: string;
			}[];
		}[];
	} = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>

	<Sidebar.Menu>
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={mainItem.isActive} class="group/collapsible">
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						<Collapsible.Trigger>
							{#snippet child({ props })}
								{#if mainItem.url}
									<a href={mainItem.url}>
										<Sidebar.MenuButton {...props}>
											{#snippet tooltipContent()}
												{mainItem.title}
											{/snippet}
											{#if mainItem.icon}
												<mainItem.icon />
											{/if}
											<span>{mainItem.title}</span>
											{#if mainItem.items}
												<ChevronRight
													class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
												/>
											{/if}
										</Sidebar.MenuButton>
									</a>
								{:else}
									<Sidebar.MenuButton {...props}>
										{#snippet tooltipContent()}
											{mainItem.title}
										{/snippet}
										{#if mainItem.icon}
											<mainItem.icon />
										{/if}
										<span>{mainItem.title}</span>
										{#if mainItem.items}
											<ChevronRight
												class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
											/>
										{/if}
									</Sidebar.MenuButton>
								{/if}
							{/snippet}
						</Collapsible.Trigger>
						<Collapsible.Content>
							{#if mainItem.items}
								<Sidebar.MenuSub>
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton>
												{#snippet child({ props })}
													<a href={subItem.url} {...props}>
														<span>{subItem.title}</span>
													</a>
												{/snippet}
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							{/if}
						</Collapsible.Content>
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
