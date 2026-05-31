<script lang="ts">
	let {
		currentPage,
		totalPages,
		totalItems,
		pageSize,
		onpagechange
	}: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		pageSize: number;
		onpagechange: (page: number) => void;
	} = $props();

	let startItem = $derived(totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1);
	let endItem = $derived(Math.min(currentPage * pageSize, totalItems));

	// Generate page numbers to display
	let displayPages = $derived.by(() => {
		const pages: number[] = [];
		const maxVisible = 5;

		if (totalPages <= 1) return [];

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);
			if (start > 2) pages.push(-1); // ellipsis
			for (let i = start; i <= end; i++) pages.push(i);
			if (end < totalPages - 1) pages.push(-1);
			pages.push(totalPages);
		}
		return pages;
	});
</script>

<div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
	<div>
		แสดงผล {startItem} ถึง {endItem} จากทั้งหมด {totalItems} รายการ
	</div>
	<div class="inline-flex items-center space-x-1">
		<button
			class="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm transition-colors"
			class:text-gray-400={currentPage <= 1 || totalPages <= 1}
			class:cursor-not-allowed={currentPage <= 1 || totalPages <= 1}
			class:text-gray-600={currentPage > 1 && totalPages > 1}
			class:hover:bg-gray-50={currentPage > 1 && totalPages > 1}
			disabled={currentPage <= 1 || totalPages <= 1}
			onclick={() => onpagechange(currentPage - 1)}
		>
			ก่อนหน้า
		</button>

		{#each displayPages as p}
			{#if p === -1}
				<span class="px-2 py-1.5 text-gray-400">…</span>
			{:else}
				<button
					class="px-3 py-1.5 border rounded text-sm font-medium transition-colors"
					class:bg-[#2A5A43]={p === currentPage}
					class:text-white={p === currentPage}
					class:border-[#2A5A43]={p === currentPage}
					class:bg-white={p !== currentPage}
					class:border-gray-300={p !== currentPage}
					class:text-gray-600={p !== currentPage}
					class:hover:bg-gray-50={p !== currentPage}
					onclick={() => onpagechange(p)}
				>
					{p}
				</button>
			{/if}
		{/each}

		<button
			class="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm transition-colors"
			class:text-gray-400={currentPage >= totalPages || totalPages <= 1}
			class:cursor-not-allowed={currentPage >= totalPages || totalPages <= 1}
			class:text-gray-600={currentPage < totalPages && totalPages > 1}
			class:hover:bg-gray-50={currentPage < totalPages && totalPages > 1}
			disabled={currentPage >= totalPages || totalPages <= 1}
			onclick={() => onpagechange(currentPage + 1)}
		>
			ถัดไป
		</button>
	</div>
</div>
