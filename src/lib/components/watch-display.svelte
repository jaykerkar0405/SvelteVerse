<script lang="ts">
	import {
		Zap,
		Wifi,
		Watch,
		Signal,
		Unlink,
		Battery,
		Calendar,
		Activity,
		HardDrive,
		AlertCircle,
		RefreshCw
	} from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { createClient } from '@supabase/supabase-js';
	import type { Watch as WatchType, WatchStatus } from '$lib/types/watch-connect';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	let {
		onUnlink,
		watchData,
		unlinkingWatch = false
	}: {
		watchData: WatchType;
		onUnlink: () => void;
		unlinkingWatch?: boolean;
	} = $props();

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	let currentTime = $state('');
	let currentDate = $state('');
	let statusError = $state(false);
	let realtimeChannel: any = null;
	let fetchingStatus = $state(false);
	let watchStatus = $state<WatchStatus | null>(null);

	const updateTime = () => {
		const now = new Date();
		currentTime = now.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
		currentDate = now.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	};

	const getBatteryColor = (level: number) => {
		if (level > 50) return 'text-green-500';
		if (level > 20) return 'text-yellow-500';
		return 'text-red-500';
	};

	const fetchWatchStatus = async () => {
		try {
			statusError = false;
			fetchingStatus = true;

			const { data, error } = await supabase
				.from('watch_status')
				.select('*')
				.eq('watch_id', watchData.id)
				.single();

			if (error && error.code !== 'PGRST116') {
				throw error;
			}

			watchStatus = data;
		} catch (error) {
			console.error('Error fetching watch status:', error);
			statusError = true;
		} finally {
			fetchingStatus = false;
		}
	};

	const subscribeToRealtime = () => {
		const channelName = `watch_status_${watchData.id}`;

		realtimeChannel = supabase
			.channel(channelName)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'watch_status',
					filter: `watch_id=eq.${watchData.id}`
				},
				(payload) => {
					watchStatus = payload.new as WatchStatus;
					statusError = false;
				}
			)
			.subscribe((status) => {
				console.log('Realtime subscription status:', status);
				if (status === 'SUBSCRIBED') {
					console.log('Successfully subscribed to realtime updates');
				} else if (status === 'CHANNEL_ERROR') {
					console.error('Channel error - retrying subscription');
					setTimeout(() => {
						subscribeToRealtime();
					}, 5000);
				} else if (status === 'TIMED_OUT') {
					console.error('Subscription timed out - retrying');
					setTimeout(() => {
						subscribeToRealtime();
					}, 5000);
				} else if (status === 'CLOSED') {
					console.log('Channel closed');
				}
			});
	};

	onMount(() => {
		updateTime();
		fetchWatchStatus();

		setTimeout(() => {
			subscribeToRealtime();
		}, 100);

		const interval = setInterval(updateTime, 1000);

		return () => {
			clearInterval(interval);
			if (realtimeChannel) {
				supabase.removeChannel(realtimeChannel);
			}
		};
	});

	onDestroy(() => {
		if (realtimeChannel) {
			supabase.removeChannel(realtimeChannel);
		}
	});
</script>

<div class="space-y-6" in:fly={{ y: 20, duration: 400, delay: 200 }}>
	<div class="space-y-3 text-center">
		<div class="flex justify-center">
			<div class="rounded-full bg-primary/10 p-3">
				<Watch class="size-6 text-primary" />
			</div>
		</div>
		<h1 class="text-2xl font-bold text-foreground">
			{watchData.brand}
			{watchData.model}
		</h1>
	</div>

	<Card class="p-6">
		<div class="flex justify-center">
			{#if watchData.screen_shape === 'round'}
				<div class="relative">
					<div class="size-48 rounded-full bg-muted p-2 shadow-lg">
						<div class="size-full rounded-full border bg-background p-4">
							<div class="flex h-full flex-col items-center justify-center space-y-2 text-center">
								<div class="text-2xl font-bold text-foreground">{currentTime}</div>
								<div class="text-xs text-muted-foreground">{currentDate}</div>
								{#if watchStatus}
									<div class="flex items-center gap-2 text-xs">
										<div
											class="flex items-center gap-1 {getBatteryColor(watchStatus.battery_level)}"
										>
											<Battery class="size-3" />
											<span>{watchStatus.battery_level}%</span>
										</div>
										{#if watchStatus.connection_type === 'wifi'}
											<Wifi class="size-3 text-primary" />
										{:else}
											<Signal class="size-3 text-primary" />
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="relative">
					<div class="size-48 rounded-xl bg-muted p-2 shadow-lg">
						<div class="size-full rounded-lg border bg-background p-4">
							<div class="flex h-full flex-col items-center justify-center space-y-2 text-center">
								<div class="text-2xl font-bold text-foreground">{currentTime}</div>
								<div class="text-xs text-muted-foreground">{currentDate}</div>
								{#if watchStatus}
									<div class="flex items-center gap-2 text-xs">
										<div
											class="flex items-center gap-1 {getBatteryColor(watchStatus.battery_level)}"
										>
											<Battery class="size-3" />
											<span>{watchStatus.battery_level}%</span>
										</div>
										{#if watchStatus.connection_type === 'wifi'}
											<Wifi class="size-3 text-primary" />
										{:else}
											<Signal class="size-3 text-primary" />
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</Card>

	<Card class="p-6">
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-foreground">Device Status</h3>

			{#if fetchingStatus}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
					{#each Array(3) as _}
						<div class="space-y-2">
							<div class="flex items-center gap-2">
								<Skeleton class="size-4 rounded" />
								<Skeleton class="h-4 w-16" />
							</div>
							<Skeleton class="h-2 w-full rounded-full" />
							<Skeleton class="h-3 w-8" />
						</div>
					{/each}
				</div>
			{:else if statusError}
				<div class="flex items-center justify-center p-8 text-center">
					<div class="space-y-3">
						<AlertCircle class="mx-auto size-8 text-destructive" />
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">Failed to load device status</p>
							<p class="text-xs text-muted-foreground">Unable to retrieve current status data</p>
						</div>
						<Button variant="default" size="sm" onclick={fetchWatchStatus}
							><RefreshCw /> Try Again</Button
						>
					</div>
				</div>
			{:else if watchStatus}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div class="space-y-3">
						<div class="flex items-center gap-2">
							<Battery class="size-4 shrink-0 text-foreground" />
							<span class="text-sm font-medium">Battery</span>
						</div>
						<div class="space-y-2">
							<div class="h-2 w-full rounded-full bg-muted">
								<div
									class="h-2 rounded-full bg-primary"
									style="width: {watchStatus.battery_level}%"
								></div>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-xs text-muted-foreground">{watchStatus.battery_level}%</span>
								{#if watchStatus.is_charging}
									<div class="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
										<Zap class="size-3 shrink-0 text-foreground" />
										<span>Charging</span>
									</div>
								{/if}
							</div>
						</div>
					</div>

					<div class="space-y-3">
						<div class="flex items-center gap-2">
							<HardDrive class="size-4 shrink-0 text-foreground" />
							<span class="text-sm font-medium">Storage</span>
						</div>
						<div class="space-y-2">
							<div class="h-2 w-full rounded-full bg-muted">
								<div
									class="h-2 rounded-full bg-primary"
									style="width: {watchStatus.storage_used_percent}%"
								></div>
							</div>
							<span class="text-xs text-muted-foreground">{watchStatus.storage_used_percent}%</span>
						</div>
					</div>

					<div class="space-y-3">
						<div class="flex items-center gap-2">
							<Activity class="size-4 shrink-0 text-foreground" />
							<span class="text-sm font-medium">RAM</span>
						</div>
						<div class="space-y-2">
							<div class="h-2 w-full rounded-full bg-muted">
								<div
									class="h-2 rounded-full bg-primary"
									style="width: {watchStatus.ram_used_percent}%"
								></div>
							</div>
							<span class="text-xs text-muted-foreground">{watchStatus.ram_used_percent}%</span>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex items-center justify-center p-8 text-center">
					<div class="space-y-3">
						<Activity class="mx-auto size-8 text-muted-foreground" />
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">No status data available</p>
							<p class="text-xs text-muted-foreground">
								Status will appear once the watch reports data
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</Card>

	<Card class="p-6">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-foreground">Device Information</h3>
				<Button variant="destructive" size="sm" onclick={onUnlink} disabled={unlinkingWatch}>
					{#if unlinkingWatch}
						<div
							class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						Unlinking...
					{:else}
						<Unlink class="size-4" />
						Unlink
					{/if}
				</Button>
			</div>

			<div class="space-y-4">
				<div class="space-y-1">
					<div class="text-sm font-medium text-muted-foreground">Android ID</div>
					<div class="break-all font-mono text-sm text-foreground">
						{watchData.android_id}
					</div>
				</div>

				<div class="grid grid-cols-2 gap-6">
					<div class="space-y-1">
						<div class="text-sm font-medium text-muted-foreground">Android Version</div>
						<div class="text-base font-semibold text-foreground">{watchData.android_version}</div>
					</div>
					<div class="space-y-1">
						<div class="text-sm font-medium text-muted-foreground">Wear OS Version</div>
						<div class="text-base font-semibold text-foreground">{watchData.wear_os_version}</div>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-6">
					<div class="space-y-1">
						<div class="text-sm font-medium text-muted-foreground">API Level</div>
						<div class="text-base font-semibold text-foreground">{watchData.api_level}</div>
					</div>
					<div class="space-y-1">
						<div class="text-sm font-medium text-muted-foreground">Screen Shape</div>
						<Badge variant="outline" class="text-sm">
							{watchData.screen_shape === 'round' ? 'Circular' : 'Square'}
						</Badge>
					</div>
				</div>

				<div class="space-y-1">
					<div class="text-sm font-medium text-muted-foreground">Connected</div>
					<div class="flex items-center gap-2 text-sm text-foreground">
						<Calendar class="h-5 w-5" />
						{new Date(watchData.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</div>
				</div>
			</div>
		</div>
	</Card>
</div>
