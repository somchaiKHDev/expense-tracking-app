<script lang="ts">
	let {
		loading = false,
		size = 'lg',
		class: cls = ''
	}: {
		loading?: boolean;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	} = $props();
</script>

{#if loading}
	<div
		class="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-base-100/70 {cls}"
	>
		<span class="loading loading-spinner loading-{size} text-primary"></span>
	</div>
{/if}
