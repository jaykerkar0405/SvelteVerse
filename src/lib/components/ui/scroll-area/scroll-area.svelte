<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Scrollbar } from './index.js';
	import { ScrollArea as ScrollAreaPrimitive, type WithoutChild } from 'bits-ui';

	let {
		children,
		class: className,
		ref = $bindable(null),
		scrollbarXClasses = '',
		scrollbarYClasses = '',
		orientation = 'vertical',
		...restProps
	}: WithoutChild<ScrollAreaPrimitive.RootProps> & {
		scrollbarXClasses?: string | undefined;
		scrollbarYClasses?: string | undefined;
		orientation?: 'vertical' | 'horizontal' | 'both' | undefined;
	} = $props();
</script>

<ScrollAreaPrimitive.Root bind:ref {...restProps} class={cn('relative overflow-hidden', className)}>
	<ScrollAreaPrimitive.Viewport class="h-full w-full rounded-[inherit] [&>*]:flex [&>*]:flex-col">
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>

	{#if orientation === 'vertical' || orientation === 'both'}
		<Scrollbar orientation="vertical" class={scrollbarYClasses} />
	{/if}
	{#if orientation === 'horizontal' || orientation === 'both'}
		<Scrollbar orientation="horizontal" class={scrollbarXClasses} />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>
