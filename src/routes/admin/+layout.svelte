<script lang="ts">
	let { children, data } = $props();
	const adminUser = $derived(data.adminUser);

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<div class="admin-shell">
	<!-- Mobile Header -->
	<header class="mobile-header">
		<div class="logo">
			<span class="logo-icon">📊</span>
			<span class="logo-text">Admin Panel</span>
		</div>
		<button class="menu-toggle" onclick={toggleMobileMenu} aria-label="Toggle menu">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				{#if mobileMenuOpen}
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</header>

	<!-- Mobile Overlay -->
	{#if mobileMenuOpen}
		<div class="mobile-overlay" onclick={closeMobileMenu} aria-hidden="true"></div>
	{/if}

	<!-- Sidebar -->
	<aside class="sidebar {mobileMenuOpen ? 'open' : ''}">
		<div class="logo">
			<span class="logo-icon">📊</span>
			<span class="logo-text">Admin Panel</span>
		</div>

		<nav class="nav">
			<ul class="nav-menu">
				<li>
					<a href="/admin/dashboard" class="nav-link active" onclick={closeMobileMenu}>
						<span class="nav-icon">⬛</span>
						Dashboard
					</a>
				</li>
			</ul>
		</nav>

		<div class="sidebar-footer">
			<div class="admin-avatar">
				{#if adminUser.image}
					<img src={adminUser.image} alt={adminUser.name} class="avatar-img" />
				{:else}
					<div class="avatar-initials">{adminUser.name[0].toUpperCase()}</div>
				{/if}
				<div class="admin-info">
					<div class="admin-name">{adminUser.name}</div>
					<div class="admin-role">Administrator</div>
				</div>
			</div>
			<a href="/" class="back-link">← Back to App</a>
		</div>
	</aside>

	<!-- Page content -->
	<main class="admin-main">
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: #0f1117;
		color: #e2e8f0;
	}

	.admin-shell {
		display: flex;
		min-height: 100vh;
	}

	/* ── Sidebar ──────────────────────────────────── */
	.sidebar {
		width: 260px;
		background: linear-gradient(180deg, #1a1d2e 0%, #0f1117 100%);
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 0;
		z-index: 100;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 28px 24px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.logo-icon {
		font-size: 22px;
	}

	.logo-text {
		font-size: 18px;
		font-weight: 700;
		background: linear-gradient(135deg, #818cf8, #c084fc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -0.3px;
	}

	.nav {
		flex: 1;
		padding: 16px 12px;
	}

	.nav-menu {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 11px 16px;
		border-radius: 10px;
		color: #94a3b8;
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.nav-link:hover,
	.nav-link.active {
		background: rgba(129, 140, 248, 0.12);
		color: #818cf8;
	}

	.nav-icon {
		font-size: 16px;
		opacity: 0.7;
	}

	.sidebar-footer {
		padding: 20px 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.admin-avatar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: rgba(255, 255, 255, 0.04);
		border-radius: 10px;
		margin-bottom: 10px;
	}

	.avatar-img {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-initials {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: linear-gradient(135deg, #818cf8, #c084fc);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 14px;
		color: white;
		flex-shrink: 0;
	}

	.admin-name {
		font-size: 13px;
		font-weight: 600;
		color: #e2e8f0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.admin-role {
		font-size: 11px;
		color: #818cf8;
		font-weight: 500;
	}

	.back-link {
		display: block;
		text-align: center;
		color: #64748b;
		font-size: 12px;
		text-decoration: none;
		padding: 8px;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.back-link:hover {
		color: #94a3b8;
		background: rgba(255, 255, 255, 0.04);
	}

	/* ── Main Content ─────────────────────────────── */
	.admin-main {
		margin-left: 260px;
		flex: 1;
		min-height: 100vh;
	}

	/* ── Mobile Header ────────────────────────────── */
	.mobile-header {
		display: none;
		align-items: center;
		justify-content: space-between;
		padding: 16px 24px;
		background: #1a1d2e;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		position: sticky;
		top: 0;
		z-index: 90;
	}

	.mobile-header .logo {
		padding: 0;
		border: none;
	}

	.menu-toggle {
		background: transparent;
		border: none;
		color: #e2e8f0;
		cursor: pointer;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mobile-overlay {
		display: none;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 95;
		backdrop-filter: blur(2px);
	}

	@media (max-width: 768px) {
		.admin-shell {
			flex-direction: column;
		}

		.mobile-header {
			display: flex;
		}

		.sidebar {
			width: 260px;
			transform: translateX(-100%);
			transition: transform 0.3s ease;
			z-index: 100;
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.sidebar .logo {
			display: none;
		}

		.mobile-overlay {
			display: block;
		}

		.admin-main {
			margin-left: 0;
			min-height: calc(100vh - 65px);
		}
	}
</style>
