<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'alert-info',
		class: cls = '',
		children
	}: {
		variant?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div role="alert" class="alert {variant} {cls}">
	{@render children?.()}
</div>
