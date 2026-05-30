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
			ctx.fillText('ไม่มีข้อมูลเดือนนี้', rect.width / 2, rect.height / 2);
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
		ctx.fillText('ยอดรวมเดือนนี้', centerX, centerY + 14);

		// Legend
		const legendY = centerY + radius + 30;
		const legendItemWidth = 120;
		const totalWidth = data.length * legendItemWidth;
		let legendX = Math.max(10, (w - totalWidth) / 2);

		data.forEach((d) => {
			// Color box
			ctx.fillStyle = d.color;
			ctx.fillRect(legendX, legendY, 10, 10);

			// Label
			ctx.fillStyle = '#6B7280';
			ctx.font = '11px Sarabun, sans-serif';
			ctx.textAlign = 'left';
			const pct = ((d.amount / total) * 100).toFixed(0);
			ctx.fillText(`${d.name} (${pct}%)`, legendX + 14, legendY + 9);

			legendX += legendItemWidth;
		});
	}

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
		store.weeklyTrend;
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
		<h1 class="text-2xl font-bold text-gray-800">แดชบอร์ดแสดงข้อมูลภาพรวม</h1>
		<p class="text-sm text-gray-500">สรุปยอดและแนวโน้มค่าใช้จ่ายตามข้อกำหนดระบบ</p>
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
			title="เดือนนี้ (This Month)"
			value="฿{formatCurrency(store.monthTotal)}"
			icon="month"
			iconBg="bg-emerald-50"
			iconColor="text-emerald-600"
			subtitle="ยอดรวมเดือนนี้"
		/>
		<SummaryCard
			title="ปีนี้ (This Year)"
			value="฿{formatCurrency(store.yearTotal)}"
			icon="year"
			iconBg="bg-purple-50"
			iconColor="text-purple-600"
			subtitle="ภาพรวมทั้งปี {new Date().getFullYear()}"
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
					สัดส่วนตามหมวดหมู่เดือนนี้
				</h3>
			</div>
			<div class="h-80 flex items-center justify-center">
				<canvas bind:this={donutCanvas} class="w-full h-full"></canvas>
			</div>
		</div>
	</section>
</div>
