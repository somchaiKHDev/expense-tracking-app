<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { LoadingSpinner } from '$lib/components/ui';
	import { useLoading } from '$lib/stores/loading.svelte';

	let { children } = $props();
	const loading = useLoading();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative min-h-screen">
	<LoadingSpinner loading={loading.active} size="xl" class="fixed inset-0 z-50 bg-base-300/40" />
	{@render children()}
</div>

