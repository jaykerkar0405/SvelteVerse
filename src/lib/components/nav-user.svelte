<script lang="ts">
	import { useAuth } from '$lib/hooks/use-auth';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { ChevronsUpDown, LogOut } from 'lucide-svelte';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	const auth = useAuth();
	const sidebar = useSidebar();
	const { user, isLoading } = $derived($auth);
</script>

{#if isLoading}
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton size="lg" aria-disabled={true}>
				<div class="h-8 w-8 animate-pulse rounded-lg bg-muted"></div>
				<div class="flex-1 space-y-2">
					<div class="h-3 w-24 animate-pulse rounded bg-muted"></div>
					<div class="h-2 w-32 animate-pulse rounded bg-muted"></div>
				</div>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
{:else if user}
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							size="lg"
							{...props}
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar.Root class="h-8 w-8 rounded-lg">
								{#if user.image}
									<Avatar.Image src={user.image} alt={user.name ?? user.email} />
								{:else}
									<Avatar.Fallback class="rounded-lg">
										{user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
									</Avatar.Fallback>
								{/if}
							</Avatar.Root>

							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{user.name ?? 'User'}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>

							<ChevronsUpDown class="ml-auto size-4" />
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>

				<DropdownMenu.Content
					align="end"
					sideOffset={4}
					side={sidebar.isMobile ? 'bottom' : 'right'}
					class="w-[var(--bits-dropdown-menu-anchor-width)] min-w-56 rounded-lg"
				>
					<DropdownMenu.Label class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar.Root class="h-8 w-8 rounded-lg">
								{#if user.image}
									<Avatar.Image src={user.image} alt={user.name ?? user.email} />
								{:else}
									<Avatar.Fallback class="rounded-lg">
										{user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
									</Avatar.Fallback>
								{/if}
							</Avatar.Root>

							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{user.name ?? 'User'}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>
						</div>
					</DropdownMenu.Label>

					<DropdownMenu.Separator />

					<DropdownMenu.Item>
						<LogOut class="mr-2 h-4 w-4" />
						Log out
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
{/if}
