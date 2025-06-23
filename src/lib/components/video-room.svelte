<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { useAuth } from '$lib/hooks/use-auth';
	import { toTitleCase } from '$lib/utils/text';
	import * as Card from '$lib/components/ui/card';
	import RoomJoining from './room-joining.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { PUBLIC_AGORA_APP_ID } from '$env/static/public';
	import { Video, VideoOff, Copy, PhoneOff, Users, User, HelpCircle } from 'lucide-svelte';
	import AgoraRTC, { type IAgoraRTCRemoteUser, type ILocalVideoTrack } from 'agora-rtc-sdk-ng';

	const auth = useAuth();
	const { user } = $derived($auth);

	let { channel } = $props();
	let isJoining = $state(true);
	let isCameraOff = $state(false);
	let remoteCameraOff = $state(false);
	let error = $state<string | null>(null);
	let video: ILocalVideoTrack | null = null;
	let users: IAgoraRTCRemoteUser[] = $state([]);
	let remoteUserName: string | null = $state(null);
	let remoteUserImage: string | null = $state(null);

	AgoraRTC.setLogLevel(2);
	const client = browser ? AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }) : null;

	const renderVideo = (_node: any, user: IAgoraRTCRemoteUser) => {
		user.videoTrack?.play(String(user.uid));
	};

	const renderLocalVideo = (_node: any) => {
		if (video && !isCameraOff) {
			video.play('local-video');
		}
	};

	async function cleanup() {
		try {
			if (video) {
				video.close();
				video = null;
			}

			if (client) {
				await client.leave();
				client.removeAllListeners();
			}

			users = [];
		} catch (err) {
			console.error('Error during cleanup:', err);
		}
	}

	async function initializeRoom() {
		if (!browser || !client) {
			error = 'Video room cannot be initialized in server-side rendering';
			isJoining = false;
			return;
		}

		try {
			if (!channel) {
				throw new Error('Channel name is required');
			}

			try {
				video = await AgoraRTC.createCameraVideoTrack();
			} catch (err) {
				throw new Error('Failed to access camera. Please check your camera permissions.');
			}

			client.on('user-published', async (user, type) => {
				try {
					if (type === 'video') {
						const existingUser = users.find((u) => u.uid === user.uid);
						if (existingUser) {
							await client.subscribe(user, 'video');
							user.videoTrack?.play(String(user.uid));
							remoteCameraOff = false;
							return;
						}

						if (users.length >= 1) {
							await cleanup();
							toast.error('Room is full', {
								description: 'This is a peer-to-peer room that only supports 2 users.'
							});

							goto('/webrtc/video/peer-to-peer');
							return;
						}

						await client.subscribe(user, 'video');
						user.videoTrack?.play(String(user.uid));
						users = [...users, user];
						remoteCameraOff = false;

						try {
							const res = await fetch(`/api/user/${user.uid}`);

							if (res.ok) {
								const remoteUserProfile = await res.json();
								remoteUserImage = remoteUserProfile.image;
								remoteUserName = remoteUserProfile.name;
							}
						} catch (e) {
							remoteUserImage = null;
							remoteUserName = null;
						}
					}
				} catch (err) {
					console.error('Error handling user-published event:', err);
					error = 'Failed to connect with new participant';
				}
			});

			client.on('user-unpublished', (user, type) => {
				if (type === 'video') {
					remoteCameraOff = true;
				}
			});

			client.on('user-left', (user) => {
				users = users.filter((u) => u.uid !== user.uid);
			});

			client.on('connection-state-change', (curState) => {
				if (curState === 'DISCONNECTED') {
					error = 'Connection lost. Please try rejoining the room.';
				}
			});

			let retryCount = 0;
			const maxRetries = 3;

			while (retryCount < maxRetries) {
				try {
					await client.join(PUBLIC_AGORA_APP_ID, channel, null, user?.id ?? '');
					await client.publish([video]);

					if (video) {
						video.play('local-video');
					}

					isJoining = false;
					error = null;
					break;
				} catch (err) {
					retryCount++;

					if (retryCount === maxRetries) {
						throw new Error(
							`Failed to join room after ${maxRetries} attempts. Please check your internet connection and try again.`
						);
					}

					await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
				}
			}
		} catch (err) {
			console.error('Error initializing room:', err);
			await cleanup();
			isJoining = false;
			error =
				err instanceof Error ? err.message : 'An unexpected error occurred while joining the room';
		}
	}

	function toggleCamera() {
		try {
			if (video && client) {
				isCameraOff = !isCameraOff;
				if (isCameraOff) {
					client.unpublish([video]);
				} else {
					client.publish([video]);
					video.play('local-video');
				}
			}
		} catch (err) {
			console.error('Error toggling camera:', err);
			error = 'Failed to toggle camera. Please try again.';
		}
	}

	async function endCall() {
		await cleanup();
		goto('/webrtc/video/peer-to-peer?reset=' + Date.now());
	}

	function copyChannel() {
		navigator.clipboard.writeText(channel);
		toast.success('Channel copied to clipboard');
	}

	onMount(() => {
		initializeRoom();
	});

	onDestroy(() => {
		cleanup();
	});
</script>

{#if isJoining}
	<div class="fade">
		<RoomJoining {channel} type="video" />
	</div>
{:else if error}
	<div class="fade flex h-full w-full items-center justify-center p-4">
		<div
			class="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-card p-8 shadow-lg"
		>
			<HelpCircle class="h-12 w-12 text-destructive" />
			<h3 class="text-lg font-semibold text-destructive">Connection Error</h3>
			<p class="text-center text-muted-foreground">{error}</p>
			<Button onclick={initializeRoom} class="mt-2 w-full">Try Again</Button>
		</div>
	</div>
{:else}
	<div class="fade relative flex h-[89vh] w-full flex-col">
		<header
			class="sticky top-0 z-30 flex w-full items-center justify-between gap-2 border-b border-border bg-background px-3 py-3 shadow-sm backdrop-blur-md sm:gap-4 sm:px-4"
		>
			<div class="flex w-full flex-col gap-2 sm:hidden">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Users class="h-4 w-4 shrink-0 text-primary" />
						<span class="text-sm font-bold tracking-tight">P2P Video</span>
					</div>
					<Button
						size="icon"
						variant="ghost"
						class="h-8 w-8"
						title="Copy channel"
						onclick={copyChannel}
						aria-label="Copy channel"
					>
						<Copy class="h-3 w-3" />
					</Button>
				</div>
				<div class="flex items-center justify-between">
					<Badge
						class="flex h-6 shrink-0 items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
					>
						{channel}
					</Badge>
					<div
						class="flex h-6 flex-row items-center gap-2 rounded-full border border-border bg-secondary px-2 py-1 shadow"
					>
						<div class="flex -space-x-1">
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border bg-primary/20"
							>
								{#if user?.image}
									<img src={user.image} alt="You" class="h-full w-full rounded-full object-cover" />
								{:else}
									<User class="h-3 w-3 text-primary" />
								{/if}
							</div>
							{#if users.length > 0}
								<div
									class="flex h-4 w-4 items-center justify-center rounded-full border bg-secondary/20"
								>
									{#if remoteUserImage}
										<img
											alt="Remote"
											src={remoteUserImage}
											class="h-full w-full rounded-full object-cover"
										/>
									{:else}
										<User class="h-3 w-3 text-secondary" />
									{/if}
								</div>
							{/if}
						</div>
						<span class="ml-1 text-xs font-medium text-foreground">{1 + users.length}</span>
					</div>
				</div>
			</div>

			<div class="hidden min-w-0 items-center gap-4 sm:flex">
				<Users class="h-5 w-5 shrink-0 text-primary" />
				<span class="hidden text-lg font-bold tracking-tight lg:block">Peer To Peer Video Room</span
				>
				<Badge
					class="ml-2 flex h-8 shrink-0 items-center rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
				>
					{channel}
				</Badge>
			</div>

			<div class="hidden items-center gap-3 sm:flex">
				<div
					class="flex h-8 flex-row items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 shadow"
				>
					<div class="flex -space-x-2">
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full border-2 bg-primary/20"
						>
							{#if user?.image}
								<img src={user.image} alt="You" class="h-full w-full rounded-full object-cover" />
							{:else}
								<User class="h-4 w-4 text-primary" />
							{/if}
						</div>
						{#if users.length > 0}
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full border-2 bg-secondary/20"
							>
								{#if remoteUserImage}
									<img
										alt="Remote"
										src={remoteUserImage}
										class="h-full w-full rounded-full object-cover"
									/>
								{:else}
									<User class="h-4 w-4 text-secondary" />
								{/if}
							</div>
						{/if}
					</div>
					<span class="ml-2 text-xs font-medium text-foreground">{1 + users.length} joined</span>
				</div>

				<Button
					size="icon"
					variant="ghost"
					title="Copy channel"
					onclick={copyChannel}
					aria-label="Copy channel"
				>
					<Copy class="h-4 w-4" />
				</Button>
			</div>
		</header>

		<main class="flex w-full flex-1 flex-col items-center justify-center px-2 py-6">
			<div
				class="grid w-full max-w-4xl grid-cols-1 items-center justify-center gap-6 sm:grid-cols-2 md:gap-10"
			>
				<Card.Root
					class="card-glow relative flex min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300"
				>
					{#if isCameraOff}
						<div class="flex h-full w-full flex-col items-center justify-center p-6">
							<div
								class="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary/30 bg-primary/10 text-2xl font-semibold text-primary sm:h-24 sm:w-24"
							>
								{#if user?.image}
									<img src={user.image} alt="You" class="h-full w-full rounded-full object-cover" />
								{:else}
									<User class="h-8 w-8 text-primary sm:h-10 sm:w-10" />
								{/if}
							</div>
							<Card.Title class="text-center text-base font-semibold sm:text-lg">You</Card.Title>
							<Card.Description class="mt-1 text-center text-xs text-muted-foreground sm:text-sm">
								Camera Off
							</Card.Description>
						</div>
					{:else}
						<div
							use:renderLocalVideo
							class="video-container absolute inset-0"
							id="local-video"
						></div>
						<div
							class="absolute bottom-4 left-4 rounded-lg border border-border bg-background/80 px-2 py-1 backdrop-blur-sm"
						>
							<span class="text-sm font-medium text-foreground">You</span>
						</div>
					{/if}
				</Card.Root>

				{#if users.length > 0}
					{@const user = users[0]}
					<Card.Root
						class="card-glow relative flex min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300"
					>
						{#if remoteCameraOff}
							<div class="flex h-full w-full flex-col items-center justify-center p-6">
								<div
									class="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-secondary/30 bg-secondary/10 text-2xl font-semibold text-secondary sm:h-24 sm:w-24"
								>
									{#if remoteUserImage}
										<img
											src={remoteUserImage}
											alt={remoteUserName ?? 'User'}
											class="h-full w-full rounded-full object-cover"
										/>
									{:else}
										<User class="h-8 w-8 text-secondary sm:h-10 sm:w-10" />
									{/if}
								</div>
								<Card.Title class="text-center text-base font-semibold sm:text-lg">
									{#if remoteUserName}
										{toTitleCase(remoteUserName)}
									{:else}
										<span class="opacity-50">Connecting...</span>
									{/if}
								</Card.Title>
								<Card.Description class="mt-1 text-center text-xs text-muted-foreground sm:text-sm">
									Camera Off
								</Card.Description>
							</div>
						{:else}
							<div
								id={String(user.uid)}
								use:renderVideo={user}
								class="video-container absolute inset-0"
							></div>
							<div
								class="absolute bottom-4 left-4 rounded-lg border border-border bg-background/80 px-2 py-1 backdrop-blur-sm"
							>
								<span class="text-sm font-medium text-foreground">
									{#if remoteUserName}
										{toTitleCase(remoteUserName)}
									{:else}
										Remote User
									{/if}
								</span>
							</div>
						{/if}
					</Card.Root>
				{:else}
					<Card.Root
						class="card-glow flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300 sm:p-6"
					>
						<div
							class="relative z-0 mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 bg-muted text-2xl font-semibold text-muted-foreground sm:h-24 sm:w-24"
						>
							<HelpCircle class="h-8 w-8 sm:h-10 sm:w-10" />
						</div>
						<Card.Title class="text-center text-base font-semibold sm:text-lg"
							>Waiting for peer...</Card.Title
						>
						<Card.Description class="mt-1 text-center text-xs text-muted-foreground sm:text-sm">
							Share the channel to invite
						</Card.Description>
					</Card.Root>
				{/if}
			</div>
		</main>

		<div class="mb-4 flex items-center justify-center md:mb-6 lg:mb-8">
			<div
				class="z-50 flex w-fit gap-4 rounded-full border bg-secondary/60 px-6 py-3 shadow-xl backdrop-blur-md md:px-8 md:py-4"
			>
				<Button
					size="icon"
					onclick={toggleCamera}
					variant={isCameraOff ? 'destructive' : 'default'}
					title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
					aria-label={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
					class="flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14"
				>
					{#if isCameraOff}
						<VideoOff class="h-6 w-6 sm:h-7 sm:w-7" />
					{:else}
						<Video class="h-6 w-6 sm:h-7 sm:w-7" />
					{/if}
				</Button>
				<Button
					size="icon"
					title="End call"
					onclick={endCall}
					variant="destructive"
					aria-label="End call"
					class="flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14"
				>
					<PhoneOff class="h-6 w-6 sm:h-7 sm:w-7" />
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.video-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.video-container :global(video) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
	}

	.fade {
		animation: fade 0.3s ease-in-out;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
