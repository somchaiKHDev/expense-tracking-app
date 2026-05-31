<script lang="ts">
	import { onMount } from 'svelte';
	import { SummaryCard } from '$lib/components/expense';
	import { useExpenseStore, formatCurrency } from '$lib/stores/expenseStore.svelte';

	const store = useExpenseStore();

	// Chart rendering
	let barCanvas: HTMLCanvasElement;
	let donutCanvas: HTMLCanvasElement;
	let chartsReady = $state(false);

	// Trend label
	let trendLabel = $derived.by(() => {
		const pct = store.todayChangePercent;
		if (pct === 0) return { text: 'ไม่มีข้อมูลเปรียบเทียบ', type: 'neutral' as const };
		if (pct < 0) return { text: `ลดลง ${Math.abs(pct).toFixed(0)}% จากเมื่อวาน`, type: 'down' as const };
		return { text: `เพิ่มขึ้น ${pct.toFixed(0)}% จากเมื่อวาน`, type: 'up' as const };
	});

	// Date filter
	const todayDate = (() => {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	})();

	async function handleStartDateChange() {
		await store.fetchStats();
	}

	function setPreset(preset: string) {
		const now = new Date();
		switch (preset) {
			case 'month':
				store.dashboardStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
				break;
			case '3months': {
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				const d = new Date(now);
				d.setMonth(d.getMonth() - 2);
				store.dashboardStartDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
				break;
			}
			case '6months': {
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				const d = new Date(now);
				d.setMonth(d.getMonth() - 5);
				store.dashboardStartDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
				break;
			}
			case 'year':
				store.dashboardStartDate = `${now.getFullYear()}-01-01`;
				break;
		}
		store.fetchStats();
	}

	let activePreset = $derived.by(() => {
		const now = new Date();
		const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
		const yearStart = `${now.getFullYear()}-01-01`;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const d3 = new Date(now);
		d3.setMonth(d3.getMonth() - 2);
		const threeMonthStart = `${d3.getFullYear()}-${String(d3.getMonth() + 1).padStart(2, '0')}-01`;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const d6 = new Date(now);
		d6.setMonth(d6.getMonth() - 5);
		const sixMonthStart = `${d6.getFullYear()}-${String(d6.getMonth() + 1).padStart(2, '0')}-01`;
		if (store.dashboardStartDate === monthStart) return 'month';
		if (store.dashboardStartDate === threeMonthStart) return '3months';
		if (store.dashboardStartDate === sixMonthStart) return '6months';
		if (store.dashboardStartDate === yearStart) return 'year';
		return 'custom';
	});

	let rangeLabel = $derived.by(() => {
		const now = new Date();
		const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
		if (store.dashboardStartDate === defaultStart) {
			return { title: 'เดือนนี้ (This Month)', subtitle: 'ยอดรวมเดือนนี้' };
		}
		const startDate = new Date(store.dashboardStartDate + 'T00:00:00');
		const startFormatted = startDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
		return { title: 'ช่วงที่เลือก', subtitle: `ตั้งแต่ ${startFormatted} ถึง วันนี้` };
	});

	function drawBarChart() {
		const ctx = barCanvas.getContext('2d');
		if (!ctx) return;

		const data = store.weeklyTrend;
		const maxVal = Math.max(...data.map((d) => d.amount), 1);

		const dpr = window.devicePixelRatio || 1;
		const rect = barCanvas.getBoundingClientRect();
		barCanvas.width = rect.width * dpr;
		barCanvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		const w = rect.width;
		const h = rect.height;
		const padding = { top: 20, right: 20, bottom: 40, left: 60 };
		const chartW = w - padding.left - padding.right;
		const chartH = h - padding.top - padding.bottom;

		ctx.clearRect(0, 0, w, h);

		// Grid lines
		ctx.strokeStyle = '#E5E7EB';
		ctx.lineWidth = 1;
		const gridLines = 5;
		for (let i = 0; i <= gridLines; i++) {
			const y = padding.top + (chartH / gridLines) * i;
			ctx.beginPath();
			ctx.moveTo(padding.left, y);
			ctx.lineTo(w - padding.right, y);
			ctx.stroke();

			// Y-axis labels
			const val = maxVal - (maxVal / gridLines) * i;
			ctx.fillStyle = '#9CA3AF';
			ctx.font = '11px Sarabun, sans-serif';
			ctx.textAlign = 'right';
			ctx.fillText(formatCurrency(val), padding.left - 8, y + 4);
		}

		// Bars
		const barWidth = Math.min(chartW / data.length * 0.6, 40);
		const gap = chartW / data.length;

		data.forEach((d, i) => {
			const barH = (d.amount / maxVal) * chartH;
			const x = padding.left + gap * i + (gap - barWidth) / 2;
			const y = padding.top + chartH - barH;

			// Bar with rounded top
			const radius = Math.min(4, barWidth / 2);
			ctx.fillStyle = '#2A5A43';
			ctx.beginPath();
			ctx.moveTo(x, y + radius);
			ctx.arcTo(x, y, x + radius, y, radius);
			ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
			ctx.lineTo(x + barWidth, padding.top + chartH);
			ctx.lineTo(x, padding.top + chartH);
			ctx.closePath();
			ctx.fill();

			// Value on top
			if (d.amount > 0) {
				ctx.fillStyle = '#374151';
				ctx.font = 'bold 11px Sarabun, sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(`฿${formatCurrency(d.amount)}`, x + barWidth / 2, y - 6);
			}

			// X-axis label
			ctx.fillStyle = '#6B7280';
			ctx.font = '12px Sarabun, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(d.label, x + barWidth / 2, h - padding.bottom + 20);
		});
	}

	function drawDonutChart() {
		const ctx = donutCanvas.getContext('2d');
		if (!ctx) return;

		const data = store.monthlyCategoryBreakdown;
		if (data.length === 0) {
			const dpr = window.devicePixelRatio || 1;
			const rect = donutCanvas.getBoundingClientRect();
			donutCanvas.width = rect.width * dpr;
			donutCanvas.height = rect.height * dpr;
			ctx.scale(dpr, dpr);
			ctx.fillStyle = '#9CA3AF';
			ctx.font = '14px Sarabun, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText('ไม่มีข้อมูลช่วงที่เลือก', rect.width / 2, rect.height / 2);
			return;
		}

		const total = data.reduce((s, d) => s + d.amount, 0);

		const dpr = window.devicePixelRatio || 1;
		const rect = donutCanvas.getBoundingClientRect();
		donutCanvas.width = rect.width * dpr;
		donutCanvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		const w = rect.width;
		const h = rect.height;
		const centerX = w / 2;
		const centerY = h / 2 - 30;
		const radius = Math.min(w, h) / 2 - 50;
		const innerRadius = radius * 0.55;

		ctx.clearRect(0, 0, w, h);

		let startAngle = -Math.PI / 2;

		data.forEach((d) => {
			const sliceAngle = (d.amount / total) * Math.PI * 2;
			const endAngle = startAngle + sliceAngle;

			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, startAngle, endAngle);
			ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
			ctx.closePath();
			ctx.fillStyle = d.color;
			ctx.fill();

			startAngle = endAngle;
		});

		// Center text
		ctx.fillStyle = '#1F2937';
		ctx.font = 'bold 16px Sarabun, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(`฿${formatCurrency(total)}`, centerX, centerY - 4);
		ctx.fillStyle = '#9CA3AF';
		ctx.font = '11px Sarabun, sans-serif';
		ctx.fillText('ยอดรวมช่วงที่เลือก', centerX, centerY + 14);

		// Legend
		ctx.font = '11px Sarabun, sans-serif';
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const lines: Array<{items: any[], width: number}> = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let currentLine: any[] = [];
		let currentLineWidth = 0;

		data.forEach((d) => {
			const pct = ((d.amount / total) * 100).toFixed(0);
			const text = `${d.name} (${pct}%)`;
			const textWidth = ctx.measureText(text).width;
			const itemWidth = 14 + textWidth + 15; // Box(10) + gap(4) + textWidth + right padding(15)

			if (currentLineWidth + itemWidth > w - 20 && currentLine.length > 0) {
				lines.push({ items: currentLine, width: currentLineWidth });
				currentLine = [{ ...d, text, itemWidth }];
				currentLineWidth = itemWidth;
			} else {
				currentLine.push({ ...d, text, itemWidth });
				currentLineWidth += itemWidth;
			}
		});
		if (currentLine.length > 0) {
			lines.push({ items: currentLine, width: currentLineWidth });
		}

		let legendY = centerY + radius + 25;
		lines.forEach(line => {
			const actualLineWidth = line.width - 15;
			let legendX = Math.max(10, (w - actualLineWidth) / 2);

			line.items.forEach(item => {
				ctx.fillStyle = item.color;
				ctx.fillRect(legendX, legendY, 10, 10);

				ctx.fillStyle = '#6B7280';
				ctx.textAlign = 'left';
				ctx.fillText(item.text, legendX + 14, legendY + 9);

				legendX += item.itemWidth;
			});
			legendY += 18;
		});
	}

	const budgetedCategories = $derived.by(() => {
		return store.categories
			.filter((c) => c.monthlyLimit !== null && c.monthlyLimit !== undefined && c.monthlyLimit > 0)
			.map((c) => {
				const limit = c.monthlyLimit || 0;
				const breakdown = store.monthlyCategoryBreakdown.find((b) => b.category_id === c.id);
				const spent = breakdown ? breakdown.amount : 0;
				const remaining = Math.max(0, limit - spent);
				const percent = limit > 0 ? (spent / limit) * 100 : 0;

				let statusText = 'ปกติ';
				let textClass = 'text-emerald-700';
				let badgeBg = 'bg-emerald-50';
				let cardBg = 'bg-white';
				let borderColor = 'border-gray-100';
				let progressBarColor = 'bg-emerald-600';

				if (spent > limit) {
					statusText = 'เกินวงเงิน';
					textClass = 'text-red-700';
					badgeBg = 'bg-red-50';
					cardBg = 'bg-red-50/20';
					borderColor = 'border-red-100';
					progressBarColor = 'bg-red-600';
				} else if (percent >= 80) {
					statusText = 'ใกล้เต็ม';
					textClass = 'text-amber-700';
					badgeBg = 'bg-amber-50';
					cardBg = 'bg-amber-50/20';
					borderColor = 'border-amber-100';
					progressBarColor = 'bg-amber-500';
				}

				return {
					id: c.id,
					name: c.name,
					limit,
					spent,
					remaining,
					percent,
					statusText,
					textClass,
					badgeBg,
					cardBg,
					borderColor,
					progressBarColor
				};
			});
	});

	const totalBudgetLimit = $derived(budgetedCategories.reduce((sum, cat) => sum + Number(cat.limit), 0));
	const totalBudgetSpent = $derived(budgetedCategories.reduce((sum, cat) => sum + Number(cat.spent), 0));

	onMount(() => {
		chartsReady = true;
		drawBarChart();
		drawDonutChart();

		const handleResize = () => {
			drawBarChart();
			drawDonutChart();
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	// Redraw charts when data changes
	$effect(() => {
		if (!chartsReady) return;
		// Touch reactive deps
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		store.weeklyTrend;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		store.monthlyCategoryBreakdown;
		// Schedule redraw
		requestAnimationFrame(() => {
			drawBarChart();
			drawDonutChart();
		});
	});
</script>

<svelte:head>
	<title>ภาพรวม — Expense Tracking System</title>
	<meta name="description" content="แดชบอร์ดสรุปยอดค่าใช้จ่ายรายวัน รายสัปดาห์ รายเดือน และรายปี พร้อมกราฟแสดงแนวโน้ม" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold text-gray-800">แดชบอร์ดแสดงข้อมูลภาพรวม</h1>
				<p class="text-sm text-gray-500">สรุปยอดและแนวโน้มค่าใช้จ่ายตามข้อกำหนดระบบ</p>
			</div>
			<div class="flex flex-col items-end gap-2">
				<div class="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#2A5A43] shrink-0" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
					</svg>
					<label for="dashboardStartDate" class="text-sm text-gray-600 font-medium whitespace-nowrap">ตั้งแต่</label>
					<input
						type="date"
						id="dashboardStartDate"
						bind:value={store.dashboardStartDate}
						max={todayDate}
						onchange={handleStartDateChange}
						class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2A5A43]/30 focus:border-[#2A5A43] transition-colors"
					/>
					<span class="text-sm text-gray-400 whitespace-nowrap">ถึง วันนี้</span>
				</div>
				<div class="flex items-center gap-1.5">
					<button onclick={() => setPreset('month')} class="text-xs px-3 py-1 rounded-full transition-colors {activePreset === 'month' ? 'bg-[#2A5A43] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">เดือนนี้</button>
					<button onclick={() => setPreset('3months')} class="text-xs px-3 py-1 rounded-full transition-colors {activePreset === '3months' ? 'bg-[#2A5A43] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">3 เดือน</button>
					<button onclick={() => setPreset('6months')} class="text-xs px-3 py-1 rounded-full transition-colors {activePreset === '6months' ? 'bg-[#2A5A43] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">6 เดือน</button>
					<button onclick={() => setPreset('year')} class="text-xs px-3 py-1 rounded-full transition-colors {activePreset === 'year' ? 'bg-[#2A5A43] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">ปีนี้</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Summary Cards -->
	<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<SummaryCard
			title="ยอดรวมวันนี้ (Today)"
			value="฿{formatCurrency(store.todayTotal)}"
			icon="today"
			iconBg="bg-blue-50"
			iconColor="text-blue-600"
			trend={trendLabel.text}
			trendType={trendLabel.type}
		/>
		<SummaryCard
			title="สัปดาห์นี้ (This Week)"
			value="฿{formatCurrency(store.weekTotal)}"
			icon="week"
			iconBg="bg-indigo-50"
			iconColor="text-indigo-600"
			subtitle="จันทร์ - อาทิตย์ ปัจจุบัน"
		/>
		<SummaryCard
			title={rangeLabel.title}
			value="฿{formatCurrency(store.monthTotal)}"
			icon="month"
			iconBg="bg-emerald-50"
			iconColor="text-emerald-600"
			subtitle={rangeLabel.subtitle}
		/>
		<SummaryCard
			title="เฉลี่ย/วัน (Daily Avg)"
			value="฿{formatCurrency(store.dailyAverage)}"
			icon="year"
			iconBg="bg-purple-50"
			iconColor="text-purple-600"
			subtitle="ค่าเฉลี่ยต่อวันในช่วงที่เลือก"
		/>
	</section>

	<!-- Charts -->
	<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Bar Chart -->
		<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-bold text-gray-700 text-lg flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#2A5A43]" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
					แนวโน้มค่าใช้จ่ายรายวัน (7 วันย้อนหลัง)
				</h3>
				<span class="text-xs text-gray-400">อัปเดตล่าสุด: วันนี้</span>
			</div>
			<div class="h-80">
				<canvas bind:this={barCanvas} class="w-full h-full"></canvas>
			</div>
		</div>

		<!-- Donut Chart -->
		<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-bold text-gray-700 text-lg flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#2A5A43]" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
					สัดส่วนตามหมวดหมู่
				</h3>
			</div>
			<div class="h-80 flex items-center justify-center">
				<canvas bind:this={donutCanvas} class="w-full h-full"></canvas>
			</div>
		</div>
	</section>

	<!-- Category Budget Dashboard Section -->
	<section class="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
			<div>
				<h3 class="font-bold text-gray-700 text-lg flex items-center gap-2 font-sarabun mb-1">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#2A5A43]" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
					</svg>
					ภาพรวมการควบคุมวงเงิน (Budget Tracking)
				</h3>
				<span class="text-xs bg-[#EAF2ED] text-[#2A5A43] px-2.5 py-1 rounded-full font-medium font-sarabun">รอบ: {rangeLabel.subtitle}</span>
			</div>
			
			{#if budgetedCategories.length > 0}
			<div class="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100">
				<div>
					<div class="text-xs text-gray-500 font-sarabun mb-0.5">ใช้ไปแล้ว</div>
					<div class="font-bold text-gray-800 text-sm leading-none">฿{formatCurrency(totalBudgetSpent)}</div>
				</div>
				<div class="w-px h-8 bg-gray-200"></div>
				<div>
					<div class="text-xs text-gray-500 font-sarabun mb-0.5">วงเงินทั้งหมด</div>
					<div class="font-bold text-[#2A5A43] text-sm leading-none">฿{formatCurrency(totalBudgetLimit)}</div>
				</div>
			</div>
			{/if}
		</div>

		{#if budgetedCategories.length === 0}
			<div class="text-center py-8 text-gray-500 text-sm font-sarabun">
				<p>ยังไม่มีหมวดหมู่ที่ตั้งวงเงินงบประมาณไว้</p>
				<p class="text-xs text-gray-400 mt-1">สามารถกำหนดวงเงินของหมวดหมู่ได้ที่หน้าจัดการหมวดหมู่</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each budgetedCategories as cat (cat.id)}
					<div class="p-5 rounded-xl border transition-all duration-200 hover:shadow-md font-sarabun {cat.cardBg} {cat.borderColor}">
						<div class="flex justify-between items-start mb-2">
							<div>
								<h4 class="font-bold text-gray-800 text-base">{cat.name}</h4>
								<p class="text-xs text-gray-500 mt-0.5">
									คงเหลือ: <span class="font-bold {cat.textClass}">฿{formatCurrency(cat.remaining)}</span>
								</p>
							</div>
							<div class="text-right">
								<span class="text-xs px-2.5 py-1 rounded-full font-bold {cat.badgeBg} {cat.textClass}">
									{cat.statusText}
								</span>
							</div>
						</div>

						<!-- Progress Bar -->
						<div class="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden mt-3 mb-2">
							<div class="h-full rounded-full transition-all duration-500 {cat.progressBarColor}" style="width: {Math.min(cat.percent, 100)}%"></div>
						</div>

						<div class="flex justify-between items-center text-xs text-gray-500">
							<span>ใช้ไปแล้ว: <span class="font-semibold text-gray-700">฿{formatCurrency(cat.spent)}</span></span>
							<span>วงเงิน: <span class="font-semibold text-gray-700">฿{formatCurrency(cat.limit)}</span> ({cat.percent.toFixed(0)}%)</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
