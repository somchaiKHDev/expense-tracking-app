<script lang="ts">
	import { brandThemes } from '$lib/themes/brands.config';
	import { themeState } from '$lib/themes/themeState.svelte';

	$effect(() => {
		document.documentElement.setAttribute('data-theme', themeState.active);
	});

	function onChange(e: Event) {
		themeState.setBrandTheme((e.target as HTMLSelectElement).value);
	}
</script>

<select class="select select-bordered select-sm" value={themeState.brandTheme} onchange={onChange}>
	{#each brandThemes as theme (theme.id)}
		<option value={theme.id}>{theme.label}</option>
	{/each}
</select>
