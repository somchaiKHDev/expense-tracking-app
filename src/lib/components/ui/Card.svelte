<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: cls = '',
		children,
		title,
		actions
	}: {
		class?: string;
		children?: Snippet;
		title?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<div class="card bg-base-100 shadow-xl dark:border dark:border-base-300 {cls}">
	<div class="card-body">
		{#if title}
			<h2 class="card-title">{@render title()}</h2>
		{/if}
		{@render children?.()}
		{#if actions}
			<div class="card-actions justify-end">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>
