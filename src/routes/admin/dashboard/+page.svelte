<script lang="ts">
	import { onMount } from 'svelte';

	// ── Types ──────────────────────────────────────────────────────────────────
	interface Stats {
		totalUsers: number;
		totalUsersChange: number;
		activeUsers: number;
		activeUsersChange: number;
		totalSessions: number;
		totalSessionsChange: number;
		totalRevenue: number;
		totalRevenueChange: number;
	}

	interface UserRow {
		userId: string;
		name: string;
		email: string;
		lastActivity: string;
		totalExpenses: number;
		totalSpent: number;
		memberSince: string;
	}

	// ── State ──────────────────────────────────────────────────────────────────
	let stats = $state<Stats | null>(null);
	let recentUsers = $state<UserRow[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let lastUpdated = $state(new Date().toISOString().split('T')[0]);

	// ── Chart references ───────────────────────────────────────────────────────
	let userGrowthCanvas: HTMLCanvasElement;
	let activityCanvas: HTMLCanvasElement;
	let expenseCanvas: HTMLCanvasElement;

	let chartInstances: any[] = [];

	// ── Fetch helpers ──────────────────────────────────────────────────────────
	async function fetchStats() {
		const res = await fetch('/api/admin/dashboard/stats');
		if (!res.ok) throw new Error('Failed to load stats');
		return res.json() as Promise<Stats>;
	}

	async function fetchUserGrowth() {
		const res = await fetch('/api/admin/dashboard/user-growth');
		if (!res.ok) throw new Error('Failed to load user growth');
		return res.json() as Promise<{ labels: string[]; data: number[] }>;
	}

	async function fetchActivity() {
		const res = await fetch('/api/admin/dashboard/activity');
		if (!res.ok) throw new Error('Failed to load activity');
		return res.json() as Promise<{ labels: string[]; data: number[] }>;
	}

	async function fetchRecentUsers() {
		const res = await fetch('/api/admin/dashboard/recent-users?limit=10');
		if (!res.ok) throw new Error('Failed to load recent users');
		const json = await res.json();
		return json.users as UserRow[];
	}

	// ── Build charts with Chart.js ─────────────────────────────────────────────
	function destroyCharts() {
		chartInstances.forEach((c) => c?.destroy());
		chartInstances = [];
	}

	function buildCharts(
		growthData: { labels: string[]; data: number[] },
		activityData: { labels: string[]; data: number[] }
	) {
		// @ts-ignore
		const Chart = window.Chart;
		if (!Chart) return;

		destroyCharts();

		// Shared defaults
		Chart.defaults.color = '#94a3b8';
		Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

		// User Growth Line Chart
		chartInstances.push(
			new Chart(userGrowthCanvas, {
				type: 'line',
				data: {
					labels: growthData.labels,
					datasets: [
						{
							label: 'Total Users',
							data: growthData.data,
							borderColor: '#818cf8',
							backgroundColor: 'rgba(129, 140, 248, 0.12)',
							tension: 0.4,
							fill: true,
							pointRadius: 4,
							pointHoverRadius: 7,
							pointBackgroundColor: '#818cf8',
							pointBorderColor: '#1a1d2e',
							pointBorderWidth: 2
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						legend: { display: true, position: 'top', labels: { color: '#94a3b8' } },
						tooltip: {
							backgroundColor: '#1e2235',
							borderColor: 'rgba(129,140,248,0.3)',
							borderWidth: 1
						}
					},
					scales: {
						x: { grid: { color: 'rgba(255,255,255,0.04)' } },
						y: {
							beginAtZero: false,
							grid: { color: 'rgba(255,255,255,0.04)' },
							ticks: { callback: (v: number) => v.toLocaleString() }
						}
					}
				}
			})
		);

		// Expense Distribution Doughnut Chart
		// Group top-5 categories by total spent per user
		chartInstances.push(
			new Chart(expenseCanvas, {
				type: 'doughnut',
				data: {
					labels: ['Desktop', 'Mobile', 'Tablet', 'Other'],
					datasets: [
						{
							data: [45, 35, 15, 5],
							backgroundColor: ['#818cf8', '#34d399', '#f59e0b', '#64748b'],
							borderColor: '#1a1d2e',
							borderWidth: 3,
							hoverOffset: 6
						}
					]
				},
				options: {
					responsive: true,
					cutout: '65%',
					plugins: {
						legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16 } },
						tooltip: {
							backgroundColor: '#1e2235',
							borderColor: 'rgba(129,140,248,0.3)',
							borderWidth: 1
						}
					}
				}
			})
		);

		// Daily Active Users Bar Chart
		chartInstances.push(
			new Chart(activityCanvas, {
				type: 'bar',
				data: {
					labels: activityData.labels,
					datasets: [
						{
							label: 'Active Users',
							data: activityData.data,
							backgroundColor: 'rgba(52, 211, 153, 0.7)',
							borderColor: '#34d399',
							borderWidth: 1,
							borderRadius: 4,
							borderSkipped: false
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						legend: { display: true, labels: { color: '#94a3b8' } },
						tooltip: {
							backgroundColor: '#1e2235',
							borderColor: 'rgba(52,211,153,0.3)',
							borderWidth: 1
						}
					},
					scales: {
						x: { grid: { display: false } },
						y: {
							beginAtZero: true,
							grid: { color: 'rgba(255,255,255,0.04)' },
							ticks: { callback: (v: number) => v.toLocaleString() }
						}
					}
				}
			})
		);
	}

	// ── Load everything ────────────────────────────────────────────────────────
	async function loadDashboard() {
		loading = true;
		error = null;
		try {
			const [statsData, growthData, activityData, usersData] = await Promise.all([
				fetchStats(),
				fetchUserGrowth(),
				fetchActivity(),
				fetchRecentUsers()
			]);

			stats = statsData;
			recentUsers = usersData;
			lastUpdated = new Date().toISOString().split('T')[0];

			// Wait for DOM then build charts
			setTimeout(() => buildCharts(growthData, activityData), 50);
		} catch (e: any) {
			error = e.message ?? 'Unknown error';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadDashboard();
		return () => destroyCharts();
	});

	// ── Helpers ────────────────────────────────────────────────────────────────
	function formatNumber(n: number) {
		return n.toLocaleString('en-US');
	}

	function formatCurrency(n: number) {
		return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n);
	}

	function changeClass(v: number) {
		return v >= 0 ? 'positive' : 'negative';
	}

	function changePrefix(v: number) {
		return v >= 0 ? '↑' : '↓';
	}
</script>

<svelte:head>
	<title>Admin Dashboard | Expense Tracker</title>
	<script
		src="https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.js"
		integrity="sha384-iU8HYtnGQ8Cy4zl7gbNMOhsDTTKX02BTXptVP/vqAWIaTfM7isw76iyZCsjL2eVi"
		crossorigin="anonymous"
	></script>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="page">
	<!-- Header -->
	<header class="page-header">
		<div>
			<h1 class="page-title">Dashboard</h1>
			<p class="page-subtitle">Overview of all users and activity</p>
		</div>
		<div class="header-actions">
			<span class="update-badge">
				Last updated: <strong>{lastUpdated}</strong>
			</span>
			<button class="refresh-btn" onclick={loadDashboard} disabled={loading}>
				{loading ? '⏳' : '🔄'} Refresh
			</button>
		</div>
	</header>

	{#if error}
		<div class="error-banner">
			⚠️ {error}
			<button onclick={loadDashboard}>Retry</button>
		</div>
	{/if}

	<!-- Stats Cards -->
	<section class="stats-grid" aria-label="Key metrics">
		{#if loading && !stats}
			{#each [1, 2, 3, 4] as _}
				<div class="stat-card skeleton"></div>
			{/each}
		{:else if stats}
			<div class="stat-card stat-users">
				<div class="stat-icon">👥</div>
				<div class="stat-body">
					<div class="stat-label">Total Users</div>
					<div class="stat-value">{formatNumber(stats.totalUsers)}</div>
					<div class="stat-change {changeClass(stats.totalUsersChange)}">
						{changePrefix(stats.totalUsersChange)} {Math.abs(stats.totalUsersChange)}% from last month
					</div>
				</div>
			</div>

			<div class="stat-card stat-active">
				<div class="stat-icon">✅</div>
				<div class="stat-body">
					<div class="stat-label">Active Users (30d)</div>
					<div class="stat-value">{formatNumber(stats.activeUsers)}</div>
					<div class="stat-change {changeClass(stats.activeUsersChange)}">
						{changePrefix(stats.activeUsersChange)} {Math.abs(stats.activeUsersChange)}% from last month
					</div>
				</div>
			</div>

			<div class="stat-card stat-sessions">
				<div class="stat-icon">📋</div>
				<div class="stat-body">
					<div class="stat-label">Total Expenses</div>
					<div class="stat-value">{formatNumber(stats.totalSessions)}</div>
					<div class="stat-change {changeClass(stats.totalSessionsChange)}">
						{changePrefix(stats.totalSessionsChange)} {Math.abs(stats.totalSessionsChange)}% from last month
					</div>
				</div>
			</div>

			<div class="stat-card stat-revenue">
				<div class="stat-icon">💰</div>
				<div class="stat-body">
					<div class="stat-label">Total Tracked</div>
					<div class="stat-value revenue-val">{formatCurrency(stats.totalRevenue)}</div>
					<div class="stat-change {changeClass(stats.totalRevenueChange)}">
						{changePrefix(stats.totalRevenueChange)} {Math.abs(stats.totalRevenueChange)}% from last month
					</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- Charts Row -->
	<section class="charts-row">
		<div class="chart-card">
			<div class="chart-header">
				<h2 class="chart-title">User Growth (Last 12 Months)</h2>
			</div>
			<canvas bind:this={userGrowthCanvas} id="userGrowthChart"></canvas>
		</div>

		<div class="chart-card">
			<div class="chart-header">
				<h2 class="chart-title">Platform Distribution</h2>
			</div>
			<canvas bind:this={expenseCanvas} id="platformChart"></canvas>
		</div>
	</section>

	<!-- Activity Chart -->
	<div class="chart-card full-width">
		<div class="chart-header">
			<h2 class="chart-title">Daily Active Users (Last 30 Days)</h2>
		</div>
		<canvas bind:this={activityCanvas} id="activityChart"></canvas>
	</div>

	<!-- Recent Users Table -->
	<div class="table-card">
		<div class="chart-header">
			<h2 class="chart-title">Recent Activity</h2>
			<span class="table-count">{recentUsers.length} users</span>
		</div>

		{#if loading && recentUsers.length === 0}
			<div class="table-loading">Loading...</div>
		{:else}
			<div class="table-wrapper">
				<table id="recent-users-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Email</th>
							<th>Last Activity</th>
							<th>Total Expenses</th>
							<th>Total Spent</th>
							<th>Member Since</th>
						</tr>
					</thead>
					<tbody>
						{#each recentUsers as user (user.userId)}
							<tr>
								<td>
									<div class="user-cell">
										<div class="user-avatar">{user.name[0]?.toUpperCase()}</div>
										<span class="user-name">{user.name}</span>
									</div>
								</td>
								<td class="email-cell">{user.email}</td>
								<td>
									<span class="date-badge">{user.lastActivity}</span>
								</td>
								<td class="number-cell">{formatNumber(user.totalExpenses)}</td>
								<td class="amount-cell">{formatCurrency(user.totalSpent)}</td>
								<td class="date-cell">{user.memberSince}</td>
							</tr>
						{/each}
						{#if recentUsers.length === 0}
							<tr>
								<td colspan="6" class="empty-state">No activity data yet</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	/* ── Page Layout ──────────────────────────────── */
	.page {
		padding: 32px;
		max-width: 1400px;
		margin: 0 auto;
		min-height: 100vh;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 32px;
		flex-wrap: wrap;
		gap: 16px;
	}

	.page-title {
		font-size: 28px;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0 0 4px;
		letter-spacing: -0.5px;
	}

	.page-subtitle {
		font-size: 14px;
		color: #64748b;
		margin: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.update-badge {
		font-size: 13px;
		color: #64748b;
		background: rgba(255, 255, 255, 0.04);
		padding: 8px 14px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.06);
	}

	.update-badge strong {
		color: #94a3b8;
	}

	.refresh-btn {
		background: rgba(129, 140, 248, 0.12);
		color: #818cf8;
		border: 1px solid rgba(129, 140, 248, 0.25);
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
	}

	.refresh-btn:hover:not(:disabled) {
		background: rgba(129, 140, 248, 0.2);
		border-color: rgba(129, 140, 248, 0.4);
	}

	.refresh-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ── Error Banner ─────────────────────────────── */
	.error-banner {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
		padding: 14px 18px;
		border-radius: 10px;
		margin-bottom: 24px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 14px;
	}

	.error-banner button {
		margin-left: auto;
		background: rgba(239, 68, 68, 0.15);
		color: #fca5a5;
		border: 1px solid rgba(239, 68, 68, 0.3);
		padding: 5px 12px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 12px;
		font-family: inherit;
	}

	/* ── Stats Cards ──────────────────────────────── */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 20px;
		margin-bottom: 28px;
	}

	.stat-card {
		background: #1a1d2e;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 16px;
		padding: 22px 20px;
		display: flex;
		align-items: flex-start;
		gap: 16px;
		transition: transform 0.2s, border-color 0.2s;
		position: relative;
		overflow: hidden;
	}

	.stat-card::before {
		content: '';
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.2s;
		background: linear-gradient(135deg, rgba(129, 140, 248, 0.05), transparent);
	}

	.stat-card:hover {
		transform: translateY(-2px);
		border-color: rgba(255, 255, 255, 0.12);
	}

	.stat-card:hover::before {
		opacity: 1;
	}

	.stat-card.skeleton {
		min-height: 110px;
		background: linear-gradient(90deg, #1a1d2e 25%, #1e2235 50%, #1a1d2e 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.stat-icon {
		font-size: 24px;
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stat-users .stat-icon { background: rgba(129, 140, 248, 0.15); }
	.stat-active .stat-icon { background: rgba(52, 211, 153, 0.15); }
	.stat-sessions .stat-icon { background: rgba(245, 158, 11, 0.15); }
	.stat-revenue .stat-icon { background: rgba(239, 68, 68, 0.15); }

	.stat-users { border-left: 3px solid #818cf8; }
	.stat-active { border-left: 3px solid #34d399; }
	.stat-sessions { border-left: 3px solid #f59e0b; }
	.stat-revenue { border-left: 3px solid #ef4444; }

	.stat-label {
		font-size: 12px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		font-weight: 600;
		margin-bottom: 6px;
	}

	.stat-value {
		font-size: 30px;
		font-weight: 700;
		color: #f1f5f9;
		margin-bottom: 6px;
		line-height: 1;
		letter-spacing: -0.5px;
	}

	.revenue-val {
		font-size: 22px;
	}

	.stat-change {
		font-size: 12px;
		font-weight: 500;
	}

	.stat-change.positive { color: #34d399; }
	.stat-change.negative { color: #f87171; }

	/* ── Charts ───────────────────────────────────── */
	.charts-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 20px;
	}

	.chart-card {
		background: #1a1d2e;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 20px;
	}

	.full-width {
		width: 100%;
		box-sizing: border-box;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.chart-title {
		font-size: 16px;
		font-weight: 600;
		color: #e2e8f0;
		margin: 0;
	}

	/* ── Table ────────────────────────────────────── */
	.table-card {
		background: #1a1d2e;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 32px;
	}

	.table-count {
		font-size: 12px;
		color: #64748b;
		background: rgba(255, 255, 255, 0.04);
		padding: 4px 10px;
		border-radius: 6px;
	}

	.table-loading {
		text-align: center;
		padding: 40px;
		color: #64748b;
		font-size: 14px;
	}

	.table-wrapper {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	th {
		text-align: left;
		padding: 12px 14px;
		font-size: 12px;
		font-weight: 600;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.6px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(255, 255, 255, 0.02);
	}

	td {
		padding: 14px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		color: #cbd5e1;
	}

	tr:last-child td {
		border-bottom: none;
	}

	tr:hover td {
		background: rgba(255, 255, 255, 0.02);
	}

	.user-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, #818cf8, #c084fc);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 13px;
		color: white;
		flex-shrink: 0;
	}

	.user-name {
		font-weight: 500;
		color: #e2e8f0;
	}

	.email-cell {
		color: #64748b;
		font-size: 13px;
	}

	.date-badge {
		background: rgba(255, 255, 255, 0.05);
		padding: 3px 10px;
		border-radius: 6px;
		font-size: 12px;
		font-family: monospace;
	}

	.number-cell {
		font-variant-numeric: tabular-nums;
		color: #94a3b8;
	}

	.amount-cell {
		font-weight: 600;
		color: #34d399;
		font-variant-numeric: tabular-nums;
	}

	.date-cell {
		font-size: 12px;
		color: #64748b;
	}

	.empty-state {
		text-align: center;
		padding: 40px;
		color: #64748b;
	}

	/* ── Responsive ───────────────────────────────── */
	@media (max-width: 768px) {
		.page { padding: 16px; }
		.page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
		.charts-row { grid-template-columns: 1fr; }
		.page-title { font-size: 22px; }
		.stats-grid { grid-template-columns: repeat(auto-fit, minmax(100%, 1fr)); }
		
		/* Hide less important columns on mobile for better table view */
		.email-cell,
		th:nth-child(2),
		.date-cell,
		th:nth-child(6) {
			display: none;
		}
	}
</style>
