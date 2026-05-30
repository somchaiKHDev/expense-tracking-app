<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'badge-primary',
		size = '',
		class: cls = '',
		children
	}: {
		variant?: string;
		size?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<span class="badge {variant} {size} {cls}">
	{@render children?.()}
</span>
