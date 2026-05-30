<script lang="ts">
	import { ExpenseNavbar } from '$lib/components/expense';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col" style="background-color: #F8F9FA;">
	<ExpenseNavbar />

	<main class="flex-1">
		{@render children()}
	</main>
</div>
