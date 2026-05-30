<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		label = '',
		placeholder = '',
		type = 'text',
		variant = '',
		error = '',
		class: cls = '',
		...rest
	}: {
		label?: string;
		placeholder?: string;
		type?: string;
		variant?: string;
		error?: string;
		class?: string;
	} & Omit<HTMLInputAttributes, 'class' | 'type' | 'placeholder'> = $props();
</script>

<fieldset class="fieldset">
	{#if label}
		<legend class="fieldset-legend">{label}</legend>
	{/if}
	<input {type} {placeholder} class="input w-full {variant} {cls}" {...rest} />
	{#if error}
		<p class="label text-error">{error}</p>
	{/if}
</fieldset>
