<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { LoadingSpinner } from '$lib/components/ui';
	import { useLoading } from '$lib/stores/loading.svelte';
	import { afterNavigate } from '$app/navigation';
	import { PUBLIC_GA_ID } from '$env/static/public';

	let { children } = $props();
	const loading = useLoading();

	afterNavigate(({ to }) => {
		if (typeof window !== 'undefined' && (window as any).gtag && PUBLIC_GA_ID) {
			(window as any).gtag('config', PUBLIC_GA_ID, {
				page_path: to?.url.pathname,
			});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative min-h-screen">
	<LoadingSpinner loading={loading.active} size="xl" class="fixed inset-0 z-50 bg-base-300/40" />
	{@render children()}
</div>

