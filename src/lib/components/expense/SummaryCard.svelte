<script lang="ts">
	let {
		title,
		value,
		subtitle,
		icon,
		iconBg = 'bg-blue-50',
		iconColor = 'text-blue-600',
		trend = '',
		trendType = 'neutral' as 'up' | 'down' | 'neutral'
	}: {
		title: string;
		value: string;
		subtitle?: string;
		icon: 'today' | 'week' | 'month' | 'year';
		iconBg?: string;
		iconColor?: string;
		trend?: string;
		trendType?: 'up' | 'down' | 'neutral';
	} = $props();
</script>

<div class="summary-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
	<div>
		<p class="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
		<h3 class="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
		{#if trend}
			<p class="text-xs mt-2" class:text-green-600={trendType === 'down'} class:text-red-500={trendType === 'up'} class:text-gray-400={trendType === 'neutral'}>
				{#if trendType === 'down'}
					<svg xmlns="http://www.w3.org/2000/svg" class="inline h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
				{:else if trendType === 'up'}
					<svg xmlns="http://www.w3.org/2000/svg" class="inline h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
				{/if}
				{trend}
			</p>
		{:else if subtitle}
			<p class="text-xs text-gray-400 mt-2">{subtitle}</p>
		{/if}
	</div>
	<div class="p-3 {iconBg} {iconColor} rounded-lg flex-shrink-0">
		{#if icon === 'today'}
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
		{:else if icon === 'week'}
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
		{:else if icon === 'month'}
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v4m0 0h4m-4 0H8" /></svg>
		{:else if icon === 'year'}
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
		{/if}
	</div>
</div>

<style>
	.summary-card {
		animation: fadeInUp 0.4s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
