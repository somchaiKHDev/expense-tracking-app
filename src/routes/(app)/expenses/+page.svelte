<script lang="ts">
	import { CategoryBadge, PaginationBar } from '$lib/components/expense';
	import { Modal, Button } from '$lib/components/ui';
	import { useExpenseStore, formatCurrency, type Expense, type SortField } from '$lib/stores/expenseStore.svelte';

	const store = useExpenseStore();

	// Edit state
	let editModalOpen = $state(false);
	let editDescription = $state('');
	let editCategoryId = $state<number>(1);
	let editAmount = $state<number>(0);
	let editDate = $state('');
	let editId = $state<number | null>(null);

	// Delete state
	let deleteModalOpen = $state(false);
	let deleteTarget = $state<Expense | null>(null);

	function startEdit(expense: Expense) {
		editId = expense.id;
		editDescription = expense.description;
		editCategoryId = expense.category_id;
		editAmount = expense.amount;
		editDate = expense.transaction_date;
		editModalOpen = true;
	}

	function saveEdit() {
		if (editId === null) return;
		store.updateExpense(editId, {
			description: editDescription,
			category_id: editCategoryId,
			amount: editAmount,
			transaction_date: editDate
		});
		editModalOpen = false;
		editId = null;
	}

	function confirmDelete(expense: Expense) {
		deleteTarget = expense;
		deleteModalOpen = true;
	}

	function executeDelete() {
		if (deleteTarget) {
			store.deleteExpense(deleteTarget.id);
			deleteTarget = null;
		}
		deleteModalOpen = false;
	}

	function handleSort(field: SortField) {
		store.toggleSort(field);
	}

	function getSortIcon(field: SortField) {
		if (store.sortField !== field) return '⇅';
		return store.sortDirection === 'asc' ? '↑' : '↓';
	}

	function handleCategoryFilter(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		store.filterCategoryId = val ? Number(val) : null;
		store.currentPage = 1;
	}

	function handleSearch(e: Event) {
		store.searchQuery = (e.target as HTMLInputElement).value;
		store.currentPage = 1;
	}

	function handleStartDate(e: Event) {
		store.filterStartDate = (e.target as HTMLInputElement).value;
		store.currentPage = 1;
	}

	function handleEndDate(e: Event) {
		store.filterEndDate = (e.target as HTMLInputElement).value;
		store.currentPage = 1;
	}

	function exportCSV() {
		const rows = store.filteredExpenses.map((e) => ({
			date: e.transaction_date,
			description: e.description,
			category: store.getCategoryName(e.category_id),
			amount: e.amount
		}));

		const csv = [
			'วันที่,รายการ,ประเภท,ค่าใช้จ่าย',
			...rows.map((r) => `${r.date},"${r.description}",${r.category},${r.amount}`)
		].join('\n');

		const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>รายการค่าใช้จ่ายทั้งหมด — Expense Tracking System</title>
	<meta name="description" content="จัดการ ค้นหา คัดกรอง และส่งออกรายงานรายการค่าใช้จ่ายทั้งหมด" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Page header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">รายการบันทึกค่าใช้จ่ายทั้งหมด</h1>
			<p class="text-sm text-gray-500">จัดการ ค้นหา คัดกรอง และส่งออกรายงานรายการค่าใช้จ่าย</p>
		</div>
		<a
			href="/add"
			class="bg-[#2A5A43] hover:bg-[#1F4332] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors self-start md:self-auto flex items-center gap-2 no-underline"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
			</svg>
			เพิ่มรายการใหม่
		</a>
	</div>

	<!-- Filters toolbar -->
	<div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
		<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
			<!-- Search -->
			<div class="relative flex-1 max-w-md">
				<span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
					</svg>
				</span>
				<input
					type="text"
					placeholder="ค้นหาตามรายละเอียดรายการ..."
					value={store.searchQuery}
					oninput={handleSearch}
					class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2A5A43] text-sm"
				/>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<!-- Category filter -->
				<select
					class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2A5A43] bg-white text-gray-600"
					onchange={handleCategoryFilter}
				>
					<option value="">-- ทุกหมวดหมู่ --</option>
					{#each store.categories as cat (cat.id)}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>

				<!-- Date range -->
				<div class="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
					</svg>
					<input
						type="date"
						class="bg-transparent border-none text-sm focus:outline-none p-0 w-28 text-gray-600"
						value={store.filterStartDate}
						oninput={handleStartDate}
					/>
					<span class="text-sm text-gray-400 mx-2">ถึง</span>
					<input
						type="date"
						class="bg-transparent border-none text-sm focus:outline-none p-0 w-28 text-gray-600"
						value={store.filterEndDate}
						oninput={handleEndDate}
					/>
				</div>

				<!-- Export button -->
				<button
					onclick={exportCSV}
					class="bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
					ส่งออก CSV
				</button>
			</div>
		</div>
	</div>

	<!-- Data Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full table-auto text-left border-collapse">
				<thead>
					<tr class="text-white text-sm font-semibold tracking-wider" style="background-color: #2A5A43;">
						<th class="px-6 py-4 border-b border-green-800 w-40 cursor-pointer select-none" onclick={() => handleSort('transaction_date')}>
							วันที่ <span class="ml-1 opacity-70">{getSortIcon('transaction_date')}</span>
						</th>
						<th class="px-6 py-4 border-b border-green-800 cursor-pointer select-none" onclick={() => handleSort('description')}>
							รายการ (Description) <span class="ml-1 opacity-70">{getSortIcon('description')}</span>
						</th>
						<th class="px-6 py-4 border-b border-green-800 w-48 cursor-pointer select-none" onclick={() => handleSort('category')}>
							ประเภท (Category) <span class="ml-1 opacity-70">{getSortIcon('category')}</span>
						</th>
						<th class="px-6 py-4 border-b border-green-800 text-right w-44 cursor-pointer select-none" onclick={() => handleSort('amount')}>
							ค่าใช้จ่าย (Amount) <span class="ml-1 opacity-70">{getSortIcon('amount')}</span>
						</th>
						<th class="px-6 py-4 border-b border-green-800 text-center w-28">จัดการ</th>
					</tr>
				</thead>
				<tbody class="text-sm divide-y divide-gray-100">
					{#each store.paginatedExpenses as expense, i (expense.id)}
						<tr class="hover:bg-gray-50 transition-colors" class:bg-white={i % 2 === 0} style={i % 2 !== 0 ? 'background-color: #F8F9FA;' : ''}>
							<td class="px-6 py-4 text-gray-500">{expense.transaction_date}</td>
							<td class="px-6 py-4 font-medium text-gray-900">{expense.description}</td>
							<td class="px-6 py-4">
								<CategoryBadge categoryId={expense.category_id} categoryName={store.getCategoryName(expense.category_id)} />
							</td>
							<td class="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(expense.amount)}</td>
							<td class="px-6 py-4 text-center space-x-2 text-base">
								<button
									class="text-blue-600 hover:text-blue-800 p-1 transition-colors"
									title="แก้ไขรายการ"
									onclick={() => startEdit(expense)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
									</svg>
								</button>
								<button
									class="text-red-600 hover:text-red-800 p-1 transition-colors"
									title="ลบรายการ"
									onclick={() => confirmDelete(expense)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
								</button>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-6 py-12 text-center text-gray-400">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								ไม่พบรายการค่าใช้จ่าย
							</td>
						</tr>
					{/each}
				</tbody>
				{#if store.paginatedExpenses.length > 0}
					<tfoot>
						<tr class="bg-gray-50 font-bold text-gray-700 text-sm border-t border-gray-200">
							<td colspan="3" class="px-6 py-4 text-left font-semibold">
								รวมค่าใช้จ่ายทั้งหมดในหน้านี้ (Page Total)
							</td>
							<td class="px-6 py-4 text-right text-lg" style="color: #2A5A43;">
								฿{formatCurrency(store.pageTotal)}
							</td>
							<td></td>
						</tr>
					</tfoot>
				{/if}
			</table>
		</div>

		<!-- Pagination -->
		<PaginationBar
			currentPage={store.currentPage}
			totalPages={store.totalPages}
			totalItems={store.totalFilteredExpenses}
			pageSize={store.pageSize}
			onpagechange={(p) => (store.currentPage = p)}
		/>
	</div>
</div>

<!-- Edit Modal -->
<Modal bind:open={editModalOpen} title="แก้ไขรายการค่าใช้จ่าย">
	<div class="space-y-4">
		<div>
			<label for="edit-date" class="block text-sm font-semibold text-gray-600 mb-1">วันที่</label>
			<input type="date" id="edit-date" bind:value={editDate} class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2A5A43]" />
		</div>
		<div>
			<label for="edit-desc" class="block text-sm font-semibold text-gray-600 mb-1">รายละเอียด</label>
			<input type="text" id="edit-desc" bind:value={editDescription} class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2A5A43]" />
		</div>
		<div>
			<label for="edit-cat" class="block text-sm font-semibold text-gray-600 mb-1">หมวดหมู่</label>
			<select id="edit-cat" bind:value={editCategoryId} class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2A5A43]">
				{#each store.categories as cat (cat.id)}
					<option value={cat.id}>{cat.name}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="edit-amount" class="block text-sm font-semibold text-gray-600 mb-1">จำนวนเงิน (บาท)</label>
			<input type="number" id="edit-amount" step="0.01" min="0" bind:value={editAmount} class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2A5A43]" />
		</div>
	</div>
	{#snippet actions()}
		<Button variant="btn-ghost" onclick={() => (editModalOpen = false)}>ยกเลิก</Button>
		<Button onclick={saveEdit}>บันทึก</Button>
	{/snippet}
</Modal>

<!-- Delete Confirmation Modal -->
<Modal bind:open={deleteModalOpen} title="ยืนยันการลบข้อมูล">
	{#if deleteTarget}
		<p class="text-gray-600">คุณแน่ใจหรือไม่ที่จะลบรายการ "<strong>{deleteTarget.description}</strong>"?</p>
		<p class="text-sm text-gray-400 mt-1">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
	{/if}
	{#snippet actions()}
		<Button variant="btn-ghost" onclick={() => (deleteModalOpen = false)}>ยกเลิก</Button>
		<Button variant="btn-error" onclick={executeDelete}>ลบ</Button>
	{/snippet}
</Modal>
