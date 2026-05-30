<script lang="ts">
	import type { ItemPrefix } from '$lib/stores/expenseStore.svelte';

	let {
		prefixes,
		onselect
	}: {
		prefixes: ItemPrefix[];
		onselect: (prefix: ItemPrefix) => void;
	} = $props();
</script>

<div class="mb-4">
	<span class="block text-sm font-semibold text-gray-600 mb-2">
		คำนำหน้าใช้บ่อย (Quick Prefix)
	</span>
	<div class="flex flex-wrap gap-2">
		{#each prefixes as prefix (prefix.id)}
			<button
				type="button"
				class="prefix-chip text-xs bg-gray-50 hover:bg-green-50 hover:text-[#2A5A43] text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 transition-all font-medium flex items-center gap-1.5 active:scale-95"
				onclick={() => onselect(prefix)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
				</svg>
				{prefix.prefix_text}
				{#if prefix.usage_count > 0}
					<span class="text-[10px] text-gray-400">({prefix.usage_count})</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.prefix-chip {
		transition: all 0.15s ease;
	}

	.prefix-chip:hover {
		box-shadow: 0 1px 3px rgba(42, 90, 67, 0.15);
	}
</style>
