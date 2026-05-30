<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: cls = '',
		trigger,
		children
	}: {
		class?: string;
		trigger: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class="dropdown {cls}">
	{@render trigger()}
	<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
		{@render children?.()}
	</ul>
</div>
