<script lang="ts">
	import {
		Alert,
		Avatar,
		Badge,
		Button,
		Card,
		DarkModeToggle,
		Dropdown,
		Input,
		LoadingSpinner,
		Modal,
		Navbar,
		Select,
		ThemeController,
		ThemeTokens,
		Toggle
	} from '$lib/components/ui';
	import { SummaryCard, CategoryBadge, PrefixChips, PaginationBar } from '$lib/components/expense';
	import { formatCurrency, type ItemPrefix } from '$lib/stores/expenseStore.svelte';

	let modalOpen = $state(false);
	let toggleChecked = $state(false);

	// --- LoadingSpinner demo ---
	let blockLoading = $state(false);

	function simulateLoad() {
		blockLoading = true;
		setTimeout(() => (blockLoading = false), 2000);
	}

	// --- Expense component demos ---
	let demoPrefixes: ItemPrefix[] = [
		{ id: 1, prefix_text: '[วัตถุดิบ]', usage_count: 12 },
		{ id: 2, prefix_text: '[ของใช้บ้าน]', usage_count: 8 },
		{ id: 3, prefix_text: '[เดลิเวอรี่]', usage_count: 5 },
		{ id: 4, prefix_text: '[ช้อปปิ้ง]', usage_count: 3 }
	];

	let selectedPrefix = $state('');
	let demoPaginationPage = $state(1);
</script>

<div class="h-screen flex flex-col overflow-hidden">
<Navbar class="sticky top-0 z-50 shadow-sm">
	{#snippet start()}
		<span class="btn btn-ghost text-xl">UI Playground</span>
	{/snippet}
	{#snippet end()}
		<div class="flex items-center gap-3">
			<Badge variant="badge-success">DaisyUI v5</Badge>
			<div><ThemeController /></div>
			<DarkModeToggle />
		</div>
	{/snippet}
</Navbar>

<main class="flex-1 overflow-y-auto overflow-x-hidden">
<div class="container mx-auto p-8 space-y-12 bg-base-200">
	<ThemeTokens />

	<!-- ═══════════════════════════════════════════ -->
	<!-- EXPENSE SYSTEM COMPONENTS                   -->
	<!-- ═══════════════════════════════════════════ -->
	<div class="divider text-lg font-bold">🧾 Expense System Components</div>

	<section>
		<h2 class="text-2xl font-bold mb-4">SummaryCard</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<SummaryCard
				title="ยอดรวมวันนี้ (Today)"
				value="฿120.00"
				icon="today"
				iconBg="bg-blue-50"
				iconColor="text-blue-600"
				trend="ลดลง 15% จากเมื่อวาน"
				trendType="down"
			/>
			<SummaryCard
				title="สัปดาห์นี้ (This Week)"
				value="฿1,450.00"
				icon="week"
				iconBg="bg-indigo-50"
				iconColor="text-indigo-600"
				subtitle="จันทร์ - อาทิตย์ ปัจจุบัน"
			/>
			<SummaryCard
				title="เดือนนี้ (This Month)"
				value="฿5,840.00"
				icon="month"
				iconBg="bg-emerald-50"
				iconColor="text-emerald-600"
				trend="เพิ่มขึ้น 20% จากเดือนก่อน"
				trendType="up"
			/>
			<SummaryCard
				title="ปีนี้ (This Year)"
				value="฿42,100.00"
				icon="year"
				iconBg="bg-purple-50"
				iconColor="text-purple-600"
				subtitle="ภาพรวมทั้งปี"
			/>
		</div>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">props: title, value, icon, iconBg, iconColor, subtitle, trend, trendType</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;SummaryCard
  title="ยอดรวมวันนี้"
  value="฿120.00"
  icon="today"
  iconBg="bg-blue-50"
  iconColor="text-blue-600"
  trend="ลดลง 15%"
  trendType="down"
/&gt;</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">icon — ชื่อไอคอน:</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>today | week | month | year</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">trendType — ประเภทแนวโน้ม:</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>up (สีแดง) | down (สีเขียว) | neutral (สีเทา)</code
				></pre>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">CategoryBadge</h2>
		<div class="flex flex-wrap gap-3 items-center">
			<CategoryBadge categoryId={1} categoryName="วัตถุดิบอาหาร" />
			<CategoryBadge categoryId={2} categoryName="ครอบครัว" />
			<CategoryBadge categoryId={3} categoryName="ของใช้" />
			<CategoryBadge categoryId={4} categoryName="อาหารสัตว์" />
			<CategoryBadge categoryId={5} categoryName="เครื่องสำอาง" />
			<CategoryBadge categoryId={99} categoryName="อื่นๆ" />
		</div>

		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">props: categoryId (กำหนดสี), categoryName (ข้อความ)</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;CategoryBadge categoryId=&#123;1&#125; categoryName="วัตถุดิบอาหาร" /&gt;</code
				></pre>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">PrefixChips</h2>
		<div class="max-w-lg bg-white p-4 rounded-xl border border-gray-100">
			<PrefixChips prefixes={demoPrefixes} onselect={(p) => (selectedPrefix = p.prefix_text)} />
			{#if selectedPrefix}
				<p class="text-sm text-gray-600 mt-2">เลือก: <code class="bg-base-200 px-2 py-0.5 rounded">{selectedPrefix}</code></p>
			{/if}
		</div>

		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">props: prefixes (ItemPrefix[]), onselect ((prefix) =&gt; void)</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;PrefixChips
  prefixes=&#123;store.sortedPrefixes&#125;
  onselect=&#123;handlePrefixSelect&#125;
/&gt;</code
				></pre>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">PaginationBar</h2>
		<div class="max-w-xl bg-white rounded-xl border border-gray-100 overflow-hidden">
			<PaginationBar
				currentPage={demoPaginationPage}
				totalPages={5}
				totalItems={48}
				pageSize={10}
				onpagechange={(p) => (demoPaginationPage = p)}
			/>
		</div>

		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">props: currentPage, totalPages, totalItems, pageSize, onpagechange</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;PaginationBar
  currentPage=&#123;store.currentPage&#125;
  totalPages=&#123;store.totalPages&#125;
  totalItems=&#123;store.totalFilteredExpenses&#125;
  pageSize=&#123;store.pageSize&#125;
  onpagechange=&#123;(p) =&gt; (store.currentPage = p)&#125;
/&gt;</code
				></pre>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════ -->
	<!-- ORIGINAL DAISYUI COMPONENTS                -->
	<!-- ═══════════════════════════════════════════ -->
	<div class="divider text-lg font-bold">🎨 DaisyUI Base Components</div>

	<section>
		<h2 class="text-2xl font-bold mb-4">Button</h2>
		<div class="flex flex-wrap gap-3">
			<Button>Primary</Button>
			<Button variant="btn-secondary">Secondary</Button>
			<Button variant="btn-accent">Accent</Button>
			<Button variant="btn-ghost">Ghost</Button>
			<Button variant="btn-error">Error</Button>
			<Button variant="btn-primary" size="btn-sm">Small</Button>
			<Button variant="btn-primary" size="btn-lg">Large</Button>
			<Button variant="btn-primary" disabled>Disabled</Button>
		</div>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">variant — กำหนดสีปุ่ม (default: <code class="rounded bg-base-300 px-1">btn-primary</code>)</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>btn-primary | btn-secondary | btn-accent | btn-ghost | btn-error | btn-warning | btn-info</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">size — กำหนดขนาด</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>btn-xs | btn-sm | btn-md (default) | btn-lg | btn-xl</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">รับ HTML button attributes ทุกตัว เช่น disabled, onclick</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Button variant="btn-error" size="btn-sm" disabled onclick=&#123;handleClick&#125;&gt;
  ลบ
&lt;/Button&gt;</code
				></pre>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Badge</h2>
		<div class="flex flex-wrap gap-3 items-center">
			<Badge>Primary</Badge>
			<Badge variant="badge-secondary">Secondary</Badge>
			<Badge variant="badge-success">Success</Badge>
			<Badge variant="badge-warning">Warning</Badge>
			<Badge variant="badge-error">Error</Badge>
			<Badge variant="badge-neutral" size="badge-sm">Small</Badge>
			<Badge variant="badge-neutral" size="badge-lg">Large</Badge>
		</div>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">variant — กำหนดสี (default: <code class="rounded bg-base-300 px-1">badge-primary</code>)</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>badge-primary | badge-secondary | badge-accent | badge-success | badge-warning | badge-error | badge-neutral</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">size — กำหนดขนาด</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>badge-xs | badge-sm | badge-md (default) | badge-lg</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">ตัวอย่าง</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Badge variant="badge-success" size="badge-sm"&gt;ใช้งาน&lt;/Badge&gt;</code
				></pre>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Alert</h2>
		<div class="space-y-3">
			<Alert variant="alert-info">ข้อมูล: นี่คือ alert-info</Alert>
			<Alert variant="alert-success">สำเร็จ: บันทึกข้อมูลเรียบร้อยแล้ว</Alert>
			<Alert variant="alert-warning">คำเตือน: กรุณาตรวจสอบข้อมูลก่อนบันทึก</Alert>
			<Alert variant="alert-error">ข้อผิดพลาด: ไม่สามารถเชื่อมต่อได้</Alert>
		</div>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">variant — กำหนดประเภท (default: <code class="rounded bg-base-300 px-1">alert-info</code>)</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>alert-info | alert-success | alert-warning | alert-error</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">ตัวอย่าง</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Alert variant="alert-success"&gt;บันทึกสำเร็จแล้ว&lt;/Alert&gt;</code
				></pre>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Card</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Card class="w-full">
				{#snippet title()}การ์ดพื้นฐาน{/snippet}
				เนื้อหาของการ์ดสามารถใส่ข้อความหรือ component อื่นๆ ได้
				{#snippet actions()}
					<Button size="btn-sm">ดูเพิ่มเติม</Button>
				{/snippet}
			</Card>
			<Card class="w-full">
				{#snippet title()}การ์ดที่มีหลายปุ่ม{/snippet}
				การ์ดนี้มีปุ่มหลายปุ่มใน actions
				{#snippet actions()}
					<Button variant="btn-ghost" size="btn-sm">ยกเลิก</Button>
					<Button size="btn-sm">ยืนยัน</Button>
				{/snippet}
			</Card>
		</div>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">snippets ที่รองรับ: <code class="rounded bg-base-300 px-1">title</code> (หัวข้อ), children (เนื้อหา), <code class="rounded bg-base-300 px-1">actions</code> (ปุ่มท้ายการ์ด จัดชิดขวา)</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Card class="w-full"&gt;
  &#123;#snippet title()&#125;หัวข้อ&#123;/snippet&#125;
  เนื้อหาของการ์ด
  &#123;#snippet actions()&#125;
    &lt;Button variant="btn-ghost" size="btn-sm"&gt;ยกเลิก&lt;/Button&gt;
    &lt;Button size="btn-sm"&gt;ยืนยัน&lt;/Button&gt;
  &#123;/snippet&#125;
&lt;/Card&gt;</code
				></pre>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Input / Select / Toggle</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
			<Input label="ชื่อ" placeholder="กรอกชื่อของคุณ" variant="input-bordered" />
			<Input label="อีเมล" type="email" placeholder="example@email.com" variant="input-bordered" />
			<Input label="รหัสผ่าน" type="password" variant="input-bordered" error="รหัสผ่านไม่ถูกต้อง" />
			<Select label="สถานะ" variant="select-bordered">
				<option value="">-- เลือกสถานะ --</option>
				<option value="active">ใช้งาน</option>
				<option value="inactive">ปิดใช้งาน</option>
			</Select>
			<div class="col-span-full">
				<Toggle label="เปิดการแจ้งเตือน" variant="toggle-primary" bind:checked={toggleChecked} />
				<p class="text-sm text-base-content/60 mt-1">สถานะ: {toggleChecked ? 'เปิด' : 'ปิด'}</p>
			</div>
		</div>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน — Input</p>
			<div class="space-y-1">
				<p class="text-base-content/60">props: label, type, placeholder, variant, error — รับ HTMLInputAttributes ทุกตัว</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Input label="อีเมล" type="email" placeholder="user@example.com"
       variant="input-bordered" error=&#123;errorMsg&#125; bind:value=&#123;email&#125; /&gt;</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="font-semibold mt-2">วิธีใช้งาน — Select</p>
				<p class="text-base-content/60">props: label, variant — ส่ง <code class="rounded bg-base-300 px-1">&lt;option&gt;</code> เป็น children, รับ HTMLSelectAttributes ทุกตัว</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Select label="สถานะ" variant="select-bordered" bind:value=&#123;status&#125;&gt;
  &lt;option value="active"&gt;ใช้งาน&lt;/option&gt;
  &lt;option value="inactive"&gt;ปิดใช้งาน&lt;/option&gt;
&lt;/Select&gt;</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="font-semibold mt-2">วิธีใช้งาน — Toggle</p>
				<p class="text-base-content/60">props: label, variant, bind:checked</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Toggle label="เปิดการแจ้งเตือน" variant="toggle-primary" bind:checked=&#123;enabled&#125; /&gt;</code
				></pre>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Avatar</h2>
		<div class="flex flex-wrap gap-4 items-center">
			<Avatar placeholder="SK" size="w-16" />
			<Avatar placeholder="AB" size="w-12" />
			<Avatar placeholder="CD" size="w-10" />
			<Avatar placeholder="EF" size="w-8" />
		</div>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">ใช้รูปภาพ — ส่ง <code class="rounded bg-base-300 px-1">src</code></p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Avatar src="/avatar.png" alt="โปรไฟล์" size="w-12" /&gt;</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">ใช้ตัวอักษรแทน — ส่ง <code class="rounded bg-base-300 px-1">placeholder</code> (หากไม่มี src)</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Avatar placeholder="SK" size="w-16" /&gt;</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">size — ใช้ Tailwind width class: <code class="rounded bg-base-300 px-1">w-8</code> / <code class="rounded bg-base-300 px-1">w-10</code> / <code class="rounded bg-base-300 px-1">w-12</code> / <code class="rounded bg-base-300 px-1">w-16</code></p>
				<p class="text-base-content/60">shape — default: <code class="rounded bg-base-300 px-1">rounded-full</code> (วงกลม), เปลี่ยนได้ เช่น <code class="rounded bg-base-300 px-1">rounded-xl</code></p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Dropdown</h2>
		<div class="flex gap-4">
			<Dropdown>
				{#snippet trigger()}
					<Button tabindex={0}>เมนู ▾</Button>
				{/snippet}
				<li><a href="/playground">หน้าแรก</a></li>
				<li><a href="/playground">โปรไฟล์</a></li>
				<li><a href="/playground">ตั้งค่า</a></li>
			</Dropdown>
			<Dropdown class="dropdown-end">
				{#snippet trigger()}
					<Button variant="btn-ghost" tabindex={0}>ตัวเลือก ▾</Button>
				{/snippet}
				<li><a href="/playground">แก้ไข</a></li>
				<li><a href="/playground" class="text-error">ลบ</a></li>
			</Dropdown>
		</div>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60"><code class="rounded bg-base-300 px-1">trigger</code> snippet (จำเป็น) — ปุ่มที่ใช้เปิด dropdown, children — รายการเมนูเป็น <code class="rounded bg-base-300 px-1">&lt;li&gt;</code></p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Dropdown class="dropdown-end"&gt;
  &#123;#snippet trigger()&#125;
    &lt;Button&gt;เมนู ▾&lt;/Button&gt;
  &#123;/snippet&#125;
  &lt;li&gt;&lt;a href="/profile"&gt;โปรไฟล์&lt;/a&gt;&lt;/li&gt;
  &lt;li&gt;&lt;a href="/settings"&gt;ตั้งค่า&lt;/a&gt;&lt;/li&gt;
&lt;/Dropdown&gt;</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">class สำหรับจัดตำแหน่ง: <code class="rounded bg-base-300 px-1">dropdown-end</code> (ชิดขวา), <code class="rounded bg-base-300 px-1">dropdown-top</code> (เปิดด้านบน)</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">LoadingSpinner</h2>
		<div class="space-y-6">
			<!-- sizes -->
			<div>
				<p class="text-sm font-medium text-base-content/60 mb-3">ขนาด (size)</p>
				<div class="flex flex-wrap items-center gap-8">
					{#each ['xs', 'sm', 'md', 'lg', 'xl'] as size (size)}
						<div class="flex flex-col items-center gap-2">
							<div
								class="relative flex h-16 w-16 items-center justify-center rounded-xl bg-base-200"
							>
								<LoadingSpinner loading size={size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'} />
							</div>
							<span class="font-mono text-xs text-base-content/50">{size}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- block overlay demo -->
			<div>
				<p class="text-sm font-medium text-base-content/60 mb-3">
					Overlay บน block element — กด "โหลด" เพื่อดูการทำงาน
				</p>
				<div class="relative rounded-2xl border-2 border-base-200 bg-base-100 p-6">
					<LoadingSpinner loading={blockLoading} />
					<div class="space-y-2">
						<p class="font-semibold">เนื้อหาใน block</p>
						<p class="text-sm text-base-content/60">
							ใส่ <code class="rounded bg-base-200 px-1">relative</code> ให้ parent แล้ววาง
							<code class="rounded bg-base-200 px-1">&lt;LoadingSpinner&gt;</code> ไว้ข้างใน
						</p>
						<Button size="btn-sm" onclick={simulateLoad} disabled={blockLoading}>
							{blockLoading ? 'กำลังโหลด...' : 'โหลด (2 วินาที)'}
						</Button>
					</div>
				</div>
			</div>

			<!-- usage guide -->
			<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm">
				<p class="font-semibold">วิธีใช้งาน</p>

				<div class="space-y-1">
					<p class="text-base-content/60">1. Standalone — overlay บน element ใดก็ได้</p>
					<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
						>&lt;div class="relative"&gt;
  &lt;LoadingSpinner loading=&#123;isLoading&#125; /&gt;
  &lt;!-- เนื้อหา --&gt;
&lt;/div&gt;</code
					></pre>
				</div>

				<div class="space-y-1">
					<p class="text-base-content/60">
						2. Global (private layout) — ใช้ <code class="rounded bg-base-300 px-1"
							>useLoading()</code
						>
						จาก page ใดก็ได้
					</p>
					<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
						>import &#123; useLoading &#125; from '$lib/stores/loading.svelte';

const loading = useLoading();

// แบบ manual
loading.show();
loading.hide();

// แบบ wrap (แนะนำ — hide อัตโนมัติแม้เกิด error)
await loading.wrap(() =&gt; fetchData());</code
					></pre>
				</div>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Modal</h2>
		<Button onclick={() => (modalOpen = true)}>เปิด Modal</Button>
		<Modal bind:open={modalOpen} title="ยืนยันการลบข้อมูล">
			<p>คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
			{#snippet actions()}
				<Button variant="btn-ghost" onclick={() => (modalOpen = false)}>ยกเลิก</Button>
				<Button variant="btn-error" onclick={() => (modalOpen = false)}>ลบ</Button>
			{/snippet}
		</Modal>

		<!-- usage guide -->
		<div class="rounded-xl bg-base-200 p-4 space-y-3 text-sm mt-4">
			<p class="font-semibold">วิธีใช้งาน</p>
			<div class="space-y-1">
				<p class="text-base-content/60">ใช้ <code class="rounded bg-base-300 px-1">bind:open</code> เพื่อควบคุมการแสดง/ซ่อน, <code class="rounded bg-base-300 px-1">title</code> — หัวข้อ modal</p>
				<pre class="overflow-x-auto rounded-lg bg-base-300 p-3 text-xs"><code
					>&lt;Modal bind:open=&#123;isOpen&#125; title="ยืนยัน"&gt;
  &lt;p&gt;เนื้อหา modal&lt;/p&gt;
  &#123;#snippet actions()&#125;
    &lt;Button variant="btn-ghost" onclick=&#123;() =&gt; (isOpen = false)&#125;&gt;ยกเลิก&lt;/Button&gt;
    &lt;Button onclick=&#123;handleConfirm&#125;&gt;ยืนยัน&lt;/Button&gt;
  &#123;/snippet&#125;
&lt;/Modal&gt;</code
				></pre>
			</div>
			<div class="space-y-1">
				<p class="text-base-content/60">คลิกพื้นหลัง (backdrop) จะปิด modal อัตโนมัติ</p>
			</div>
		</div>
	</section>
</div>
</main>
</div>
