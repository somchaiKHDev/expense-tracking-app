<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type ColorToken = { name: string; cssVar: string; value: string };
	type SimpleToken = { name: string; cssVar: string; value: string };
	type OtherToken = { label: string; cssVar: string; value: string };

	const COLOR_NAMES = [
		'primary',
		'primary-content',
		'secondary',
		'secondary-content',
		'accent',
		'accent-content',
		'neutral',
		'neutral-content',
		'base-100',
		'base-200',
		'base-300',
		'base-400',
		'base-500',
		'base-content',
		'info',
		'info-content',
		'success',
		'success-content',
		'warning',
		'warning-content',
		'error',
		'error-content'
	];

	const RADIUS_NAMES = ['selector', 'field', 'box'];
	const SIZE_NAMES = ['selector', 'field'];
	const OTHER_DEFS = [
		{ label: 'border', cssVar: '--border' },
		{ label: 'depth', cssVar: '--depth' },
		{ label: 'noise', cssVar: '--noise' }
	];

	let colors = $state<ColorToken[]>([]);
	let radii = $state<SimpleToken[]>([]);
	let sizes = $state<SimpleToken[]>([]);
	let others = $state<OtherToken[]>([]);

	function readAll() {
		const style = getComputedStyle(document.documentElement);
		const get = (v: string) => style.getPropertyValue(v).trim() || '—';

		colors = COLOR_NAMES.map((n) => ({ name: n, cssVar: `--color-${n}`, value: get(`--color-${n}`) }));
		radii = RADIUS_NAMES.map((n) => ({ name: n, cssVar: `--radius-${n}`, value: get(`--radius-${n}`) }));
		sizes = SIZE_NAMES.map((n) => ({ name: n, cssVar: `--size-${n}`, value: get(`--size-${n}`) }));
		others = OTHER_DEFS.map((d) => ({ ...d, value: get(d.cssVar) }));
	}

	let observer: MutationObserver | undefined;

	onMount(() => {
		readAll();
		observer = new MutationObserver(readAll);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	});

	onDestroy(() => observer?.disconnect());
</script>

<section>
	<h2 class="text-2xl font-bold mb-6">Theme Token System</h2>

	<!-- Colors -->
	<div class="mb-8">
		<h3 class="text-lg font-semibold mb-3">Colors</h3>
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
			{#each colors as token (token.name)}
				<div class="rounded-xl overflow-hidden border border-base-300">
					<div class="h-12 w-full" style="background: var({token.cssVar})"></div>
					<div class="bg-base-100 p-2">
						<p class="text-xs font-mono font-semibold truncate">{token.name}</p>
						<p class="text-xs text-base-content/50 font-mono truncate">{token.value}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Radius -->
	<div class="mb-8">
		<h3 class="text-lg font-semibold mb-3">Border Radius</h3>
		<div class="flex flex-wrap gap-6">
			{#each radii as token (token.name)}
				<div class="flex flex-col items-center gap-2">
					<div
						class="w-16 h-16 bg-primary"
						style="border-radius: {token.value !== '—' ? token.value : '0'}"
					></div>
					<p class="text-xs font-mono font-semibold">{token.name}</p>
					<p class="text-xs text-base-content/50 font-mono">{token.value}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Sizes, Border, Effects -->
	<div>
		<h3 class="text-lg font-semibold mb-3">Other Tokens</h3>
		<div class="rounded-xl bg-base-200 p-4">
			<table class="w-full text-sm font-mono">
				<thead>
					<tr class="text-base-content/50 text-left">
						<th class="pb-2 pr-8">Token</th>
						<th class="pb-2 pr-8">CSS Variable</th>
						<th class="pb-2">Value</th>
					</tr>
				</thead>
				<tbody>
					{#each sizes as token (token.cssVar)}
						<tr>
							<td class="py-1 pr-8">size-{token.name}</td>
							<td class="py-1 pr-8 text-base-content/50">{token.cssVar}</td>
							<td class="py-1">{token.value}</td>
						</tr>
					{/each}
					{#each others as token (token.cssVar)}
						<tr>
							<td class="py-1 pr-8">{token.label}</td>
							<td class="py-1 pr-8 text-base-content/50">{token.cssVar}</td>
							<td class="py-1">{token.value}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>
