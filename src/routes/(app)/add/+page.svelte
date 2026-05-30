<script lang="ts">
	import { goto } from '$app/navigation';
	import { PrefixChips } from '$lib/components/expense';
	import { useExpenseStore, type ItemPrefix } from '$lib/stores/expenseStore.svelte';

	const store = useExpenseStore();

	let description = $state('');
	let categoryId = $state<number | ''>('');
	let amount = $state<number | ''>('');
	let transactionDate = $state(new Date().toISOString().split('T')[0]);

	let successMessage = $state('');
	let errorMessage = $state('');
	let descriptionInput: HTMLInputElement;

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
		transactionDate = new Date().toISOString().split('T')[0];

		// Clear success after 3s
		setTimeout(() => {
			successMessage = '';
		}, 3000);
	}

	function handleReset() {
		description = '';
		categoryId = '';
		amount = '';
		transactionDate = new Date().toISOString().split('T')[0];
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
				<label for="category" class="block text-sm font-semibold text-gray-600 mb-1.5">
					หมวดหมู่ <span class="text-red-500">*</span>
				</label>
				<select
					id="category"
					bind:value={categoryId}
					class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A5A43] focus:border-transparent text-sm bg-white"
					required
				>
					<option value="" disabled>-- เลือกหมวดหมู่ค่าใช้จ่าย --</option>
					{#each store.categories as cat (cat.id)}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
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

	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}
</style>
