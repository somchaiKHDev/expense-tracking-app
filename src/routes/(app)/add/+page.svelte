<script lang="ts">
	import { goto } from '$app/navigation';
	import { PrefixChips } from '$lib/components/expense';
	import { useExpenseStore, type ItemPrefix } from '$lib/stores/expenseStore.svelte';

	function getLocalISODate() {
		const tzOffset = new Date().getTimezoneOffset() * 60000;
		return new Date(Date.now() - tzOffset).toISOString().slice(0, 10);
	}

	const store = useExpenseStore();

	let description = $state('');
	let categoryId = $state<number | ''>('');
	let amount = $state<number | ''>('');
	let transactionDate = $state(getLocalISODate());
	let errorMessage = $state('');
	let successMessage = $state('');
	let showAddCategory = $state(false);
	let newCategoryName = $state('');
	let newCategoryLimit = $state<number | ''>('');
	let addingCategory = $state(false);
	let addCategoryError = $state('');
	let descriptionInput = $state<HTMLInputElement>();
	let newCategoryInput = $state<HTMLInputElement>();

	let showEditLimit = $state(false);
	let editLimitValue = $state<number | ''>('');
	let editCategoryName = $state('');
	let updatingLimit = $state(false);
	let editLimitError = $state('');

	$effect(() => {
		if (categoryId) {
			const selectedCat = store.categories.find((c) => c.id === Number(categoryId));
			if (selectedCat) {
				editLimitValue = selectedCat.monthlyLimit ?? '';
				editCategoryName = selectedCat.name;
			}
		} else {
			showEditLimit = false;
		}
	});

	async function handleUpdateLimit() {
		if (!categoryId) return;
		updatingLimit = true;
		editLimitError = '';
		try {
			const limit = typeof editLimitValue === 'number' ? editLimitValue : null;
			await store.updateCategory(Number(categoryId), editCategoryName, limit);
			showEditLimit = false;
		} catch {
			editLimitError = 'ไม่สามารถแก้ไขวงเงินได้';
		} finally {
			updatingLimit = false;
		}
	}

	async function handleAddCategory() {
		const trimmed = newCategoryName.trim();
		if (!trimmed) return;
		addingCategory = true;
		addCategoryError = '';
		try {
			const limit = typeof newCategoryLimit === 'number' ? newCategoryLimit : null;
			const addedCategory = await store.addCategory(trimmed, limit);
			if (addedCategory) {
				categoryId = addedCategory.id;
			}
			newCategoryName = '';
			newCategoryLimit = '';
			showAddCategory = false;
		} catch {
			addCategoryError = 'ไม่สามารถเพิ่มหมวดหมู่ได้ (อาจซ้ำกับที่มีอยู่)';
		} finally {
			addingCategory = false;
		}
	}

	function handlePrefixSelect(prefix: ItemPrefix) {
		description = prefix.prefix_text + ' ';
		store.incrementPrefixUsage(prefix.id);

		// Auto-select category based on prefix
		if (prefix.prefix_text.includes('วัตถุดิบ') || prefix.prefix_text.includes('เดลิเวอรี่')) {
			categoryId = 1; // วัตถุดิบอาหาร
		} else if (prefix.prefix_text.includes('ของใช้')) {
			categoryId = 3; // ของใช้
		} else if (prefix.prefix_text.includes('ช้อปปิ้ง')) {
			categoryId = 5; // เครื่องสำอาง
		}

		// Focus the input and move cursor to end
		setTimeout(() => {
			descriptionInput?.focus();
			descriptionInput?.setSelectionRange(description.length, description.length);
		}, 0);
	}

	function handleSubmit() {
		errorMessage = '';
		successMessage = '';

		if (!description.trim()) {
			errorMessage = 'กรุณากรอกรายละเอียดรายการ';
			return;
		}
		if (!categoryId) {
			errorMessage = 'กรุณาเลือกหมวดหมู่';
			return;
		}
		if (!amount || Number(amount) <= 0) {
			errorMessage = 'กรุณากรอกจำนวนเงินที่ถูกต้อง';
			return;
		}

		store.addExpense({
			description: description.trim(),
			category_id: Number(categoryId),
			amount: Number(amount),
			transaction_date: transactionDate
		});

		successMessage = 'บันทึกข้อมูลเรียบร้อยแล้ว!';

		// Reset form
		description = '';
		categoryId = '';
		amount = '';
		transactionDate = getLocalISODate();

		// Clear success after 3s
		setTimeout(() => {
			successMessage = '';
		}, 3000);
	}

	function handleReset() {
		description = '';
		categoryId = '';
		amount = '';
		transactionDate = getLocalISODate();
		errorMessage = '';
		successMessage = '';
	}
</script>

<svelte:head>
	<title>บันทึกค่าใช้จ่ายใหม่ — Expense Tracking System</title>
	<meta name="description" content="เพิ่มรายการค่าใช้จ่ายใหม่พร้อมระบบคำนำหน้าด่วน" />
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
	<div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
		<!-- Header -->
		<div class="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
			<div class="p-2.5 bg-green-50 text-[#2A5A43] rounded-lg">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<div>
				<h3 class="font-bold text-gray-800 text-lg">เพิ่มรายการค่าใช้จ่ายใหม่</h3>
				<p class="text-xs text-gray-400">กรุณากรอกข้อมูลเพื่อจัดเก็บลงในระบบฐานข้อมูล</p>
			</div>
		</div>

		<!-- Alert messages -->
		{#if successMessage}
			<div class="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2 animate-fadeIn">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
				</svg>
				{successMessage}
			</div>
		{/if}
		{#if errorMessage}
			<div class="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2 animate-fadeIn">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
				{errorMessage}
			</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<!-- Date -->
			<div class="mb-5">
				<label for="transaction_date" class="block text-sm font-semibold text-gray-600 mb-1.5">
					วันที่เกิดค่าใช้จ่าย <span class="text-red-500">*</span>
				</label>
				<input
					type="date"
					id="transaction_date"
					bind:value={transactionDate}
					class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A5A43] focus:border-transparent text-sm bg-white"
					required
				/>
			</div>

			<!-- Prefix Chips -->
			<PrefixChips prefixes={store.sortedPrefixes} onselect={handlePrefixSelect} />

			<!-- Description -->
			<div class="mb-5">
				<label for="description" class="block text-sm font-semibold text-gray-600 mb-1.5">
					รายละเอียดรายการ <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="description"
					bind:this={descriptionInput}
					bind:value={description}
					placeholder="พิมพ์รายละเอียดหรือคลิกคำนำหน้าด่วนด้านบน"
					class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A5A43] focus:border-transparent text-sm"
					required
				/>
			</div>

			<!-- Category -->
			<div class="mb-5">
				<div class="flex items-center justify-between mb-1.5">
					<label for="category" class="block text-sm font-semibold text-gray-600">
						หมวดหมู่ <span class="text-red-500">*</span>
					</label>
					<div class="flex items-center gap-2">
						{#if categoryId}
							<button
								type="button"
								onclick={() => {
									showEditLimit = !showEditLimit;
									showAddCategory = false;
									editLimitError = '';
									const selectedCat = store.categories.find(c => c.id === Number(categoryId));
									if (selectedCat) {
										editLimitValue = selectedCat.monthlyLimit ?? '';
										editCategoryName = selectedCat.name;
									}
								}}
								class="edit-limit-btn"
								title="แก้ไขวงเงินหมวดหมู่ที่เลือก"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
								แก้ไขวงเงิน
							</button>
						{/if}
						<button
							type="button"
							onclick={() => {
								showAddCategory = !showAddCategory;
								showEditLimit = false;
								addCategoryError = '';
								if (showAddCategory) setTimeout(() => newCategoryInput?.focus(), 50);
							}}
							class="add-cat-btn"
							title="เพิ่มหมวดหมู่ใหม่"
						>
							{#if showAddCategory}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
							{/if}
							เพิ่มหมวดหมู่
						</button>
					</div>
				</div>

				<select
					id="category"
					bind:value={categoryId}
					class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A5A43] focus:border-transparent text-sm bg-white"
					required
				>
					<option value="" disabled>-- เลือกหมวดหมู่ค่าใช้จ่าย --</option>
					{#each store.categories as cat (cat.id)}
						<option value={cat.id}>{cat.name}{cat.monthlyLimit ? ` (วงเงิน: ${cat.monthlyLimit} บ.)` : ''}</option>
					{/each}
				</select>
 
				{#if showEditLimit && categoryId}
					<div class="edit-limit-panel animate-fadeIn">
						<div class="flex items-center gap-2">
							<span class="text-xs text-gray-500 font-medium">แก้ไขวงเงิน "{editCategoryName}":</span>
							<input
								bind:value={editLimitValue}
								type="number"
								placeholder="ไม่มีวงเงิน"
								class="add-cat-input w-28"
								min="0"
								step="1"
								disabled={updatingLimit}
								onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUpdateLimit(); } }}
							/>
							<button
								type="button"
								onclick={handleUpdateLimit}
								disabled={updatingLimit}
								class="add-cat-submit"
							>
								{#if updatingLimit}
									<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
								{:else}
									บันทึก
								{/if}
							</button>
							<button
								type="button"
								onclick={() => { showEditLimit = false; }}
								class="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
							>
								ยกเลิก
							</button>
						</div>
						{#if editLimitError}
							<p class="text-xs text-red-500 mt-1.5">{editLimitError}</p>
						{/if}
					</div>
				{/if}

				{#if showAddCategory}
					<div class="add-cat-panel animate-fadeIn">
						<div class="flex gap-2">
							<input
								bind:this={newCategoryInput}
								bind:value={newCategoryName}
								type="text"
								placeholder="ชื่อหมวดหมู่ใหม่..."
								class="add-cat-input flex-1"
								disabled={addingCategory}
								onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
							/>
							<input
								bind:value={newCategoryLimit}
								type="number"
								placeholder="วงเงิน/ด"
								class="add-cat-input w-24"
								min="0"
								step="1"
								disabled={addingCategory}
								onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
							/>
							<button
								type="button"
								onclick={handleAddCategory}
								disabled={addingCategory || !newCategoryName.trim()}
								class="add-cat-submit"
							>
								{#if addingCategory}
									<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
								{:else}
									เพิ่ม
								{/if}
							</button>
						</div>
						{#if addCategoryError}
							<p class="text-xs text-red-500 mt-1.5">{addCategoryError}</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Amount -->
			<div class="mb-8">
				<label for="amount" class="block text-sm font-semibold text-gray-600 mb-1.5">
					จำนวนเงิน (บาท) <span class="text-red-500">*</span>
				</label>
				<div class="relative rounded-md shadow-sm">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<span class="text-gray-400 text-sm">฿</span>
					</div>
					<input
						type="number"
						step="0.01"
						min="0"
						id="amount"
						bind:value={amount}
						placeholder="0.00"
						class="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A5A43] focus:border-transparent text-sm"
						required
					/>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex space-x-3">
				<button
					type="button"
					onclick={handleReset}
					class="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm text-center"
				>
					ล้างฟอร์ม
				</button>
				<button
					type="submit"
					class="w-2/3 bg-[#2A5A43] hover:bg-[#1F4332] text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
					บันทึกรายการข้อมูล
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}

	.animate-spin {
		animation: spin 0.7s linear infinite;
	}

	/* Edit limit button */
	.edit-limit-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.72rem;
		font-weight: 600;
		color: #4b5563;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 0.2rem 0.55rem;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}
	.edit-limit-btn:hover {
		background: #e5e7eb;
		color: #1f2937;
	}

	.edit-limit-panel {
		margin-top: 0.5rem;
		padding: 0.65rem 0.75rem;
		background: #f9fafb;
		border: 1px dashed #d1d5db;
		border-radius: 8px;
	}

	/* Add category button */
	.add-cat-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.72rem;
		font-weight: 600;
		color: #2A5A43;
		background: #f0f7f4;
		border: 1px solid #c6dfd5;
		border-radius: 6px;
		padding: 0.2rem 0.55rem;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}
	.add-cat-btn:hover {
		background: #d9ede5;
		color: #1F4332;
	}

	/* Inline add panel */
	.add-cat-panel {
		margin-top: 0.5rem;
		padding: 0.65rem 0.75rem;
		background: #f8fdf9;
		border: 1px dashed #9ecdb7;
		border-radius: 8px;
	}

	.add-cat-input {
		flex: 1;
		padding: 0.45rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.8rem;
		outline: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.add-cat-input:focus {
		border-color: #2A5A43;
		box-shadow: 0 0 0 2px rgba(42,90,67,0.15);
	}

	.add-cat-submit {
		padding: 0.45rem 1rem;
		background: #2A5A43;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		transition: background 0.15s;
		white-space: nowrap;
	}
	.add-cat-submit:hover:not(:disabled) {
		background: #1F4332;
	}
	.add-cat-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
