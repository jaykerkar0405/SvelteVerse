<script lang="ts">
	import { fade } from 'svelte/transition';
	import { useAuth } from '$lib/hooks/use-auth';
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import { Users, Mic, Key, ArrowRight, Sparkles } from 'lucide-svelte';

	const auth = useAuth();
	const { user } = $derived($auth);

	let error = $state('');
	let loading = $state(false);
	let channelName = $state('');
	let isJoining = $state(false);

	const channelPattern = /^\d{3}-[a-z]{4}-\d{3}$/;

	function generateRandomChannel() {
		const digits = () => Math.floor(100 + Math.random() * 900).toString();
		const letters = () =>
			Array.from({ length: 4 }, () =>
				String.fromCharCode(97 + Math.floor(Math.random() * 26))
			).join('');

		return `${digits()}-${letters()}-${digits()}`;
	}

	const handleJoin = async () => {
		error = '';

		if (!channelPattern.test(channelName)) {
			error =
				'Channel name must be in the format: 123-abcd-456 (3 digits, 4 lowercase letters, 3 digits)';
			return;
		}

		loading = true;
		await new Promise((r) => setTimeout(r, 1000));
		loading = false;
		isJoining = true;
	};

	const handleRandomJoin = async () => {
		channelName = generateRandomChannel();

		error = '';
		loading = true;
		await new Promise((r) => setTimeout(r, 1000));
		loading = false;
		isJoining = true;
	};
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
	{#if !isJoining}
		<div transition:fade={{ duration: 300 }} class="w-full max-w-md">
			<Card class="relative overflow-hidden p-8 shadow-lg">
				<div
					class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"
				></div>
				<div
					class="bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"
				></div>
				<div class="relative">
					<div class="mb-8 text-center">
						<div
							class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
						>
							<Sparkles class="h-3.5 w-3.5" />
							Peer-to-Peer
						</div>
						<div class="mb-4 flex justify-center">
							<div class="rounded-full bg-primary/10 p-3">
								<Users class="h-6 w-6 text-primary" />
							</div>
						</div>
						<h1 class="text-3xl font-bold tracking-tight">Join Audio Room</h1>
						<p class="mt-2 text-sm text-muted-foreground">
							Connect directly with others through secure peer-to-peer voice chat
						</p>
					</div>
					<div class="space-y-6">
						<div class="space-y-2">
							<Label for="channel" class="text-base">Channel Name</Label>
							<div class="relative">
								<Input
									id="channel"
									disabled={loading}
									bind:value={channelName}
									placeholder="e.g. 123-abcd-456"
									class="h-11 w-full pl-10 transition-all focus:ring-2 focus:ring-primary/20"
								/>
								<Key
									class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
								/>
							</div>
							<p class="text-xs text-muted-foreground">
								Format: 3 digits, 4 lowercase letters, 3 digits
							</p>
						</div>

						{#if error}
							<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						{/if}

						<div class="space-y-3">
							<Button
								onclick={handleJoin}
								disabled={!channelName || loading}
								class="h-11 w-full transition-all hover:scale-[1.02]"
							>
								{#if loading}
									<Spinner className="mr-2" />
								{:else}
									<Mic class="mr-2 h-4 w-4" />
								{/if}
								Join Room
							</Button>

							<div class="relative">
								<div class="absolute inset-0 flex items-center">
									<span class="w-full border-t"></span>
								</div>
								<div class="relative flex justify-center text-xs uppercase">
									<span class="bg-background px-2 text-muted-foreground">or</span>
								</div>
							</div>

							<Button
								disabled={loading}
								variant="secondary"
								onclick={handleRandomJoin}
								class="h-11 w-full transition-all hover:scale-[1.02]"
							>
								{#if loading}
									<Spinner className="mr-2" />
								{:else}
									<ArrowRight class="mr-2 h-4 w-4" />
								{/if}
								Create Random Channel & Join
							</Button>
						</div>
					</div>
				</div>
			</Card>
		</div>
	{:else}
		<div transition:fade={{ duration: 300 }} class="text-center">
			<div class="mb-4 flex justify-center">
				<div class="flex items-center justify-center rounded-full bg-primary/10 p-4">
					<Spinner className="h-8 w-8 text-primary" />
				</div>
			</div>
			<h2 class="text-xl font-semibold">Joining Room...</h2>
			<p class="mt-2 text-sm text-muted-foreground">Please wait while we connect you</p>
		</div>
	{/if}
</div>
