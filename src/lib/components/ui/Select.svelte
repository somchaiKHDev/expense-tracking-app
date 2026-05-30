<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let {
		label = '',
		variant = '',
		class: cls = '',
		children,
		...rest
	}: {
		label?: string;
		variant?: string;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLSelectAttributes, 'class'> = $props();
</script>

<label class="form-control w-full">
	{#if label}
		<div class="label">
			<span class="label-text">{label}</span>
		</div>
	{/if}
	<select class="select {variant} {cls}" {...rest}>
		{@render children?.()}
	</select>
</label>
