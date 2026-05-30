<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/', label: 'ภาพรวม', icon: 'chart-pie' },
		{ href: '/add', label: 'บันทึกค่าใช้จ่าย', icon: 'plus-circle' },
		{ href: '/expenses', label: 'รายการทั้งหมด', icon: 'list-ul' }
	];

	let mobileMenuOpen = $state(false);
	let currentPath = $derived($page.url.pathname);
</script>

<nav class="expense-navbar shadow-md">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center">
				<a href="/" class="flex items-center gap-3 text-white no-underline">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
					</svg>
					<span class="font-bold text-xl tracking-wide">Expense Tracking</span>
				</a>

				<div class="hidden md:flex ml-8 space-x-1 text-sm">
					{#each navItems as item}
						<a
							href={item.href}
							class="nav-link"
							class:nav-link-active={currentPath === item.href}
						>
							{#if item.icon === 'chart-pie'}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
							{:else if item.icon === 'plus-circle'}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
							{/if}
							{item.label}
						</a>
					{/each}
				</div>
			</div>

			<div class="hidden md:flex items-center gap-3">
				<div class="text-sm bg-[#1F4332] px-3 py-1.5 rounded-md border border-green-700 text-white flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
					v3 System
				</div>
			</div>

			<!-- Mobile menu button -->
			<button
				class="md:hidden text-white p-2"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle menu"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					{#if mobileMenuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden pb-4 space-y-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="nav-link block"
						class:nav-link-active={currentPath === item.href}
						onclick={() => (mobileMenuOpen = false)}
					>
						{item.label}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</nav>

<style>
	.expense-navbar {
		background-color: #2A5A43;
		color: white;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-weight: 500;
		color: rgba(229, 231, 235, 0.85);
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.nav-link:hover {
		background-color: #1F4332;
		color: white;
	}

	.nav-link-active {
		background-color: #1F4332;
		color: white;
	}
</style>
