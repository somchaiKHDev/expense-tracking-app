<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Page Not Found | Expense App</title>
</svelte:head>

<div class="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
	<div class="mb-8">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 mx-auto text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
			<path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	</div>
	<h1 class="text-6xl font-bold text-gray-900 mb-4 tracking-tight">404</h1>
	<h2 class="text-2xl font-semibold text-gray-700 mb-4">Page not found</h2>
	<p class="text-gray-500 max-w-md mb-8">
		We couldn't find the page you were looking for at <span class="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 text-sm">{$page.url.pathname}</span>.
		It might have been removed, renamed, or didn't exist in the first place.
	</p>
	<a href={resolve('/')} class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors duration-200">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
			<path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
		</svg>
		Back to Dashboard
	</a>
</div>
