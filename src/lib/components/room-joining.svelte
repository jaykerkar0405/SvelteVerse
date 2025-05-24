<script lang="ts">
	import Spinner from './ui/spinner/spinner.svelte';

	let { type, channel } = $props();
</script>

<div class="flex min-h-[400px] flex-col items-center justify-center space-y-4 fade-in">
	<div class="space-y-2 text-center">
		<h2 class="text-2xl font-semibold">Joining Room</h2>
		<p class="text-muted-foreground">Connecting to {channel}...</p>
	</div>
	<Spinner size={40} color="#3B82F6" />
	<div class="text-sm text-muted-foreground">Please wait while we set up your {type}...</div>
</div>

<style>
	.fade-in {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
