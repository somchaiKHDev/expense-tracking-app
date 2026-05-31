<script lang="ts">
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';

	const navItems = [
		{ href: '/', label: 'ภาพรวม', icon: 'chart-pie' },
		{ href: '/add', label: 'บันทึกค่าใช้จ่าย', icon: 'plus-circle' },
		{ href: '/expenses', label: 'รายการทั้งหมด', icon: 'list-ul' }
	];

	let mobileMenuOpen = $state(false);
	let currentPath = $derived($page.url.pathname);

	// Get session from page data (provided by root +layout.server.ts)
	let session = $derived($page.data.session);
	let user = $derived(session?.user);

	async function handleSignOut() {
		await signOut({ callbackUrl: '/login' });
	}
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
					{#if user?.isAdmin}
						<a
							href="/admin/dashboard"
							class="nav-link text-yellow-300 hover:text-yellow-100"
							class:nav-link-active={currentPath.startsWith('/admin')}
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
							Admin
						</a>
					{/if}
				</div>
			</div>

			<!-- User Info + Logout (Desktop) -->
			<div class="hidden md:flex items-center gap-3">
				{#if user}
					<!-- Avatar -->
					<div class="user-info">
						{#if user.image}
							<img src={user.image} alt={user.name ?? 'User'} class="avatar" referrerpolicy="no-referrer" />
						{:else}
							<div class="avatar-placeholder">
								{(user.name ?? user.email ?? '?')[0].toUpperCase()}
							</div>
						{/if}
						<span class="user-name">{user.name ?? user.email}</span>
					</div>

					<!-- Sign out button -->
					<button class="signout-btn" onclick={handleSignOut} id="signout-btn" title="ออกจากระบบ">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						ออกจากระบบ
					</button>
				{/if}
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
				{#if user?.isAdmin}
					<a
						href="/admin/dashboard"
						class="nav-link block text-yellow-300"
						class:nav-link-active={currentPath.startsWith('/admin')}
						onclick={() => (mobileMenuOpen = false)}
					>
						Admin Dashboard
					</a>
				{/if}
				{#if user}
					<div class="mobile-user-info">
						<span class="text-white/70 text-sm">{user.name ?? user.email}</span>
					</div>
					<button class="signout-btn w-full mt-2" onclick={handleSignOut}>
						ออกจากระบบ
					</button>
				{/if}
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

	/* User info */
	.user-info {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.375rem 0.625rem;
		background: rgba(255,255,255,0.08);
		border-radius: 10px;
		border: 1px solid rgba(255,255,255,0.12);
	}

	.avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 700;
		color: white;
	}

	.user-name {
		font-size: 0.85rem;
		color: rgba(255,255,255,0.9);
		font-weight: 500;
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Sign out button */
	.signout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.4rem 0.875rem;
		background: rgba(239, 68, 68, 0.15);
		color: #fca5a5;
		border: 1px solid rgba(239, 68, 68, 0.25);
		border-radius: 8px;
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.signout-btn:hover {
		background: rgba(239, 68, 68, 0.28);
		color: #fecaca;
		border-color: rgba(239, 68, 68, 0.4);
	}

	.mobile-user-info {
		padding: 0.5rem 0.75rem;
	}
</style>
