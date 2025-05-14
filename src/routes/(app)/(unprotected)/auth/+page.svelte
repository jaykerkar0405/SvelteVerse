<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import LoginForm from '$lib/components/login-form.svelte';

	onMount(() => {
		const message = $page.url.searchParams.get('message');
		if (message) {
			toast.info(message);
		}
	});

	const redirectParam = $page.url.searchParams.get('redirectTo');
	const redirectTo = redirectParam ? `/${redirectParam}` : '/dashboard';
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<LoginForm {redirectTo} />
</div>
