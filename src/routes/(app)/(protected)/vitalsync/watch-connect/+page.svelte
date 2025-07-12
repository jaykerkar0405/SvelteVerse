<script lang="ts">
	import {
		User,
		Mail,
		Watch,
		QrCode,
		Unlink,
		RefreshCw,
		Smartphone,
		CheckCircle,
		AlertCircle
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { fade, fly } from 'svelte/transition';
	import { useAuth } from '$lib/hooks/use-auth';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import { createClient } from '@supabase/supabase-js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import QrScanner from '$lib/components/qr-scanner.svelte';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	const auth = useAuth();
	const { user, isLoading } = $derived($auth);
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	let hasChecked = $state(false);
	let checkError = $state(false);
	let userExists = $state(false);
	let syncingUser = $state(false);
	let checkingUser = $state(false);
	let watchLinked = $state(false);
	let linkingWatch = $state(false);
	let showQrScanner = $state(false);
	let syncCompleted = $state(false);
	let unlinkingWatch = $state(false);
	let checkingWatchLink = $state(false);
	let watchData = $state<Watch | null>(null);

	const showContent = $derived(!!user && hasChecked && !checkingUser);
	const showSkeletonLoader = $derived(isLoading || (checkingUser && !hasChecked));

	const checkUserExists = async () => {
		if (!user?.email || checkingUser || hasChecked) return;

		try {
			checkError = false;
			checkingUser = true;

			const { data, error } = await supabase
				.from('user')
				.select('id')
				.eq('email', user.email)
				.single();

			if (error && error.code !== 'PGRST116') {
				throw error;
			}

			hasChecked = true;
			userExists = !!data;

			if (data) {
				await checkWatchLink(data.id);
			}
		} catch (error) {
			checkError = true;
			toast.error('Failed to check user status');
		} finally {
			checkingUser = false;
		}
	};

	const checkWatchLink = async (userId: string) => {
		try {
			checkingWatchLink = true;

			const { data, error } = await supabase
				.from('user_watch_link')
				.select(
					`
					*,
					watch:watch_id (
						id,
						android_id,
						brand,
						model,
						screen_shape,
						wear_os_version,
						api_level,
						android_version,
						created_at
					)
				`
				)
				.eq('user_id', userId)
				.single();

			if (error && error.code !== 'PGRST116') {
				throw error;
			}

			watchLinked = !!data;
			watchData = data?.watch || null;
		} catch (error) {
			toast.error('Failed to check watch link status');
		} finally {
			checkingWatchLink = false;
		}
	};

	const syncUser = async () => {
		if (!user || syncingUser) return;

		const syncPromise = new Promise(async (resolve, reject) => {
			try {
				syncingUser = true;

				const name = user?.name || user?.email?.split('@')[0];
				const encodedName = encodeURIComponent(name);
				const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=ffffff&color=000000`;

				const { data, error } = await supabase
					.from('user')
					.insert({
						name,
						email: user?.email,
						image: user?.image || avatarUrl,
						email_verified: user?.emailVerified || false
					})
					.select()
					.single();

				if (error) {
					throw error;
				}

				userExists = true;
				syncCompleted = true;

				await checkWatchLink(data.id);
				resolve('User synced successfully!');
			} catch (error) {
				console.error('Error syncing user:', error);
				reject(error);
			} finally {
				syncingUser = false;
			}
		});

		toast.promise(syncPromise, {
			loading: 'Syncing your account...',
			success: 'Account synced successfully!',
			error: 'Failed to sync account. Please try again.'
		});
	};

	const handleQrScan = async (androidId: string) => {
		if (!user?.email || linkingWatch) return;

		try {
			linkingWatch = true;

			const { data: userData, error: userError } = await supabase
				.from('user')
				.select('id')
				.eq('email', user.email)
				.single();

			if (userError) throw userError;

			const { data: watchData, error: watchError } = await supabase
				.from('watch')
				.select('id')
				.eq('android_id', androidId)
				.single();

			if (watchError && watchError.code !== 'PGRST116') {
				throw watchError;
			}

			if (!watchData) {
				toast.error('Watch not found. Please ensure the watch is registered.');
				return;
			}

			const { error: linkError } = await supabase.from('user_watch_link').insert({
				user_id: userData.id,
				watch_id: watchData.id
			});

			if (linkError) throw linkError;

			await checkWatchLink(userData.id);
			showQrScanner = false;
			toast.success('Watch linked successfully!');
		} catch (error) {
			toast.error('Failed to link watch. Please try again.');
		} finally {
			linkingWatch = false;
		}
	};

	const unlinkWatch = async () => {
		if (!user?.email || unlinkingWatch) return;

		try {
			unlinkingWatch = true;

			const { data: userData, error: userError } = await supabase
				.from('user')
				.select('id')
				.eq('email', user.email)
				.single();

			if (userError) throw userError;

			const { error } = await supabase.from('user_watch_link').delete().eq('user_id', userData.id);

			if (error) throw error;

			watchLinked = false;
			watchData = null;
			toast.success('Watch unlinked successfully!');
		} catch (error) {
			console.error('Error unlinking watch:', error);
			toast.error('Failed to unlink watch. Please try again.');
		} finally {
			unlinkingWatch = false;
		}
	};

	onMount(() => {
		if (user && !isLoading) {
			checkUserExists();
		}
	});

	$effect(() => {
		if (user && !isLoading && !hasChecked && !checkingUser) {
			checkUserExists();
		}
	});
</script>

<div class="flex min-h-[93vh] items-center justify-center bg-background px-6 py-4">
	<div class="w-full max-w-md">
		{#if showSkeletonLoader || showContent}
			<Card class="relative overflow-hidden border-border/50 p-8 shadow-lg">
				<div
					class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"
				></div>
				<div
					class="bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"
				></div>

				<div class="relative">
					{#if showSkeletonLoader}
						<div class="space-y-6">
							<div class="text-center">
								<div class="mb-4 flex justify-center">
									<Skeleton class="size-12 rounded-lg" />
								</div>
								<Skeleton class="mx-auto mb-2 h-8 w-48" />
								<Skeleton class="mx-auto h-4 w-32" />
							</div>

							<div class="space-y-4">
								<div
									class="flex items-center space-x-3 rounded-lg border border-border bg-card p-4"
								>
									<Skeleton class="size-12 rounded-lg" />
									<div class="flex-1 space-y-2">
										<Skeleton class="h-4 w-32" />
										<Skeleton class="h-3 w-48" />
									</div>
								</div>
								<Skeleton class="h-11 w-full rounded-md" />
							</div>
						</div>
					{:else if showContent}
						{#if showQrScanner}
							<QrScanner
								{linkingWatch}
								on:scan={(e) => handleQrScan(e.detail)}
								on:cancel={() => (showQrScanner = false)}
							/>
						{:else if userExists && watchLinked && watchData}
							<div
								class="space-y-6"
								out:fade={{ duration: 200 }}
								in:fly={{ y: 20, duration: 400, delay: 200 }}
							>
								<div class="text-center">
									<div class="mb-4 flex justify-center">
										<div class="rounded-full bg-green-500/10 p-3 ring-1 ring-green-500/20">
											<Watch class="size-6 text-green-600" />
										</div>
									</div>
									<h1 class="text-3xl font-bold tracking-tight text-foreground">
										Watch Connected!
									</h1>
									<p class="mt-2 text-sm text-muted-foreground">
										Your smartwatch is linked to your account
									</p>
								</div>

								<div class="space-y-4">
									<div class="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
										<div class="flex items-center gap-3">
											<div class="rounded-lg bg-primary/10 p-2">
												<Watch class="size-5 text-primary" />
											</div>
											<div class="min-w-0 flex-1">
												<div class="mb-1 flex items-center gap-2">
													<Smartphone class="size-4 text-muted-foreground" />
													<p class="text-sm font-medium text-foreground">
														{watchData.brand}
														{watchData.model}
													</p>
												</div>
												<div class="flex items-center gap-2 text-xs text-muted-foreground">
													<span>Android ID: {watchData.android_id.slice(0, 8)}...</span>
													<span>•</span>
													<span>{watchData.screen_shape} screen</span>
												</div>
											</div>
										</div>
									</div>

									<div
										class="flex items-center space-x-3 rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm"
									>
										<div class="flex-shrink-0">
											<Avatar.Root class="size-12 rounded-lg ring-1 ring-border">
												{#if user?.image}
													<Avatar.Image src={user.image} alt={user?.name ?? user.email} />
												{:else}
													<Avatar.Fallback
														class="rounded-lg bg-primary/10 font-medium text-primary"
													>
														{user?.name?.[0]?.toUpperCase() ?? user?.email[0].toUpperCase()}
													</Avatar.Fallback>
												{/if}
											</Avatar.Root>
										</div>
										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-2">
												<User class="size-4 text-muted-foreground" />
												<p class="truncate text-sm font-medium text-foreground">
													{user?.name || user?.email.split('@')[0]}
												</p>
											</div>
											<div class="mt-1 flex items-center gap-2">
												<Mail class="size-4 text-muted-foreground" />
												<p class="truncate text-sm text-muted-foreground">
													{user?.email}
												</p>
											</div>
										</div>
									</div>

									<Button
										variant="outline"
										onclick={unlinkWatch}
										disabled={unlinkingWatch}
										class="h-11 w-full rounded-md"
									>
										{#if unlinkingWatch}
											<div
												class="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
											></div>
											Unlinking...
										{:else}
											<Unlink class="mr-2 size-4" />
											Unlink Watch
										{/if}
									</Button>
								</div>
							</div>
						{:else if userExists && !watchLinked}
							<div
								class="space-y-6"
								out:fade={{ duration: 200 }}
								in:fly={{ y: 20, duration: 400, delay: 200 }}
							>
								<div class="text-center">
									<div class="mb-4 flex justify-center">
										<div class="rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
											<QrCode class="size-6 text-primary" />
										</div>
									</div>
									<h1 class="text-3xl font-bold tracking-tight text-foreground">Link Your Watch</h1>
									<p class="mt-2 text-sm text-muted-foreground">
										Scan the QR code from your smartwatch to connect
									</p>
								</div>

								<div class="space-y-4">
									<div
										class="flex items-center space-x-3 rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm"
									>
										<div class="flex-shrink-0">
											<Avatar.Root class="size-12 rounded-lg ring-1 ring-border">
												{#if user?.image}
													<Avatar.Image src={user.image} alt={user?.name ?? user.email} />
												{:else}
													<Avatar.Fallback
														class="rounded-lg bg-primary/10 font-medium text-primary"
													>
														{user?.name?.[0]?.toUpperCase() ?? user?.email[0].toUpperCase()}
													</Avatar.Fallback>
												{/if}
											</Avatar.Root>
										</div>
										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-2">
												<User class="size-4 text-muted-foreground" />
												<p class="truncate text-sm font-medium text-foreground">
													{user?.name || user?.email.split('@')[0]}
												</p>
											</div>
											<div class="mt-1 flex items-center gap-2">
												<Mail class="size-4 text-muted-foreground" />
												<p class="truncate text-sm text-muted-foreground">
													{user?.email}
												</p>
											</div>
										</div>
									</div>

									{#if checkingWatchLink}
										<div
											class="rounded-md border border-border bg-card/50 p-3 text-sm text-muted-foreground"
										>
											<div class="flex items-center gap-2">
												<div
													class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
												></div>
												Checking watch connection...
											</div>
										</div>
									{/if}

									<Button
										disabled={checkingWatchLink}
										class="h-11 w-full rounded-md"
										onclick={() => (showQrScanner = true)}
									>
										<QrCode class="mr-2 size-4" />
										Scan QR Code
									</Button>
								</div>
							</div>
						{:else if !userExists}
							<div
								class="space-y-6"
								out:fade={{ duration: 200 }}
								in:fly={{ y: 20, duration: 400, delay: 200 }}
							>
								<div class="text-center">
									<div class="mb-4 flex justify-center">
										<div class="rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
											<User class="size-6 text-primary" />
										</div>
									</div>
									<h1 class="text-3xl font-bold tracking-tight text-foreground">
										Sync Your Account
									</h1>
									<p class="mt-2 text-sm text-muted-foreground">
										Link your account with VitalSync to continue
									</p>
								</div>

								<div class="space-y-4">
									<div
										class="flex items-center space-x-3 rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm"
									>
										<div class="flex-shrink-0">
											<Avatar.Root class="size-12 rounded-lg ring-1 ring-border">
												{#if user?.image}
													<Avatar.Image src={user.image} alt={user?.name ?? user.email} />
												{:else}
													<Avatar.Fallback
														class="rounded-lg bg-primary/10 font-medium text-primary"
													>
														{user?.name?.[0]?.toUpperCase() ?? user?.email[0].toUpperCase()}
													</Avatar.Fallback>
												{/if}
											</Avatar.Root>
										</div>
										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-2">
												<User class="size-4 text-muted-foreground" />
												<p class="truncate text-sm font-medium text-foreground">
													{user?.name || user?.email.split('@')[0]}
												</p>
											</div>
											<div class="mt-1 flex items-center gap-2">
												<Mail class="size-4 text-muted-foreground" />
												<p class="truncate text-sm text-muted-foreground">
													{user?.email}
												</p>
											</div>
										</div>
									</div>

									{#if checkError}
										<div
											in:fly={{ y: 10, duration: 300 }}
											class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
										>
											<div class="flex items-center gap-2">
												<AlertCircle class="size-4" />
												Failed to check user status. Please try again.
											</div>
										</div>
									{/if}

									<Button
										onclick={syncUser}
										class="h-11 w-full rounded-md"
										disabled={syncingUser || syncCompleted}
										variant={syncCompleted ? 'outline' : 'default'}
									>
										{#if syncingUser}
											<div
												class="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
											></div>
											Syncing...
										{:else if syncCompleted}
											<CheckCircle class="mr-2 size-4" />
											Synced
										{:else}
											<RefreshCw class="mr-2 size-4" />
											Sync Account
										{/if}
									</Button>
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</Card>
		{/if}
	</div>
</div>
