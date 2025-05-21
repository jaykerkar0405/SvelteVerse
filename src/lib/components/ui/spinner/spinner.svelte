<script lang="ts">
	export let size: number = 20;
	export let className: string = '';
	export let color: string = 'currentColor';
</script>

<div class="loader-container {className}" style="width: {size}px; height: {size}px;">
	<div class="loader" style="border-color: {color} transparent {color} transparent;"></div>
</div>

<style>
	.loader-container {
		display: inline-block;
		position: relative;
	}

	.loader {
		box-sizing: border-box;
		display: block;
		position: absolute;
		width: 100%;
		height: 100%;
		border: 2px solid;
		border-radius: 50%;
		animation: loader 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	}

	@keyframes loader {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
