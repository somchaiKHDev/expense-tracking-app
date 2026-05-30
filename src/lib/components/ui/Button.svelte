<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		variant = 'btn-primary',
		size = '',
		class: cls = '',
		children,
		...rest
	}: {
		variant?: string;
		size?: string;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLButtonAttributes, 'class'> = $props();
</script>

<button class="btn {variant} {size} {cls}" {...rest}>
	{@render children?.()}
</button>
