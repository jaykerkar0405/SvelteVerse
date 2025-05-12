<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { setAuth } from '$lib/hooks/use-auth';
	import { Toaster } from '$lib/components/ui/sonner';

	let { data, children } = $props<{ data: { user: any } }>();

	setAuth(data.user);
</script>

<ModeWatcher />
<Toaster richColors position="bottom-right" />

{@render children?.()}
