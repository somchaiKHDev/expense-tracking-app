<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		label = '',
		variant = '',
		class: cls = '',
		checked = $bindable(false),
		...rest
	}: {
		label?: string;
		variant?: string;
		class?: string;
		checked?: boolean;
	} & Omit<HTMLInputAttributes, 'class' | 'type' | 'checked'> = $props();
</script>

<label class="label cursor-pointer gap-4">
	{#if label}
		<span class="label-text">{label}</span>
	{/if}
	<input type="checkbox" class="toggle {variant} {cls}" bind:checked {...rest} />
</label>
