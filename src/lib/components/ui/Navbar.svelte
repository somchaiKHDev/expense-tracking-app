<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: cls = '',
		start,
		center,
		end
	}: {
		class?: string;
		start?: Snippet;
		center?: Snippet;
		end?: Snippet;
	} = $props();
</script>

<div class="navbar bg-base-100 {cls}">
	{#if start}
		<div class="navbar-start">{@render start()}</div>
	{/if}
	{#if center}
		<div class="navbar-center">{@render center()}</div>
	{/if}
	{#if end}
		<div class="navbar-end">{@render end()}</div>
	{/if}
</div>
