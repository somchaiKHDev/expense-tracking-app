# Theme Token System Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `ThemeTokens` component that reads all DaisyUI design tokens from live CSS custom properties and displays them as the first section in the playground page, updating automatically on dark mode toggle.

**Architecture:** A standalone `ThemeTokens.svelte` component reads CSS variables via `getComputedStyle` on mount and re-reads whenever `data-theme` changes via `MutationObserver`. Token names are predefined in five groups (colors, radius, sizes, border, effects); missing values fall back to `—`.

**Tech Stack:** Svelte 5 (`$state`, `onMount`, `onDestroy`), Vitest + @testing-library/svelte, DaisyUI v5, Tailwind CSS v4

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/lib/components/ui/ThemeTokens.svelte` | Create | Component: reads tokens, renders grouped display |
| `src/lib/components/ui/ThemeTokens.test.ts` | Create | Unit tests: render structure, fallback, value display |
| `src/lib/components/ui/index.ts` | Modify | Export `ThemeTokens` |
| `src/routes/playground/+page.svelte` | Modify | Import and place `<ThemeTokens />` as first section |

---

## Task 1: Write failing tests for ThemeTokens

**Files:**
- Create: `src/lib/components/ui/ThemeTokens.test.ts`

- [ ] **Step 1: Create the test file**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import ThemeTokens from './ThemeTokens.svelte';

describe('ThemeTokens', () => {
	let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
			getPropertyValue: (prop: string) => {
				const map: Record<string, string> = {
					'--color-primary': '#f8c430',
					'--color-secondary': '#222e59',
					'--radius-box': '0.5rem',
					'--size-field': '0.25rem',
					'--border': '1px',
					'--depth': '1',
					'--noise': '0'
				};
				return map[prop] ?? '';
			}
		} as CSSStyleDeclaration);
	});

	afterEach(() => {
		getComputedStyleSpy.mockRestore();
	});

	it('renders a heading', () => {
		const { getByText } = render(ThemeTokens);
		expect(getByText('Theme Token System')).toBeInTheDocument();
	});

	it('renders color token names', () => {
		const { getAllByText, getByText } = render(ThemeTokens);
		expect(getByText('primary')).toBeInTheDocument();
		expect(getByText('secondary')).toBeInTheDocument();
		expect(getByText('error')).toBeInTheDocument();
		// base tokens
		expect(getAllByText(/^base-/).length).toBeGreaterThanOrEqual(5);
	});

	it('renders resolved color values from getComputedStyle', () => {
		const { getByText } = render(ThemeTokens);
		expect(getByText('#f8c430')).toBeInTheDocument();
		expect(getByText('#222e59')).toBeInTheDocument();
	});

	it('renders radius token names', () => {
		const { getAllByText } = render(ThemeTokens);
		// 'selector' and 'field' appear in both radius and size groups
		expect(getAllByText('selector').length).toBeGreaterThanOrEqual(1);
		expect(getAllByText('field').length).toBeGreaterThanOrEqual(1);
		expect(getAllByText('box').length).toBeGreaterThanOrEqual(1);
	});

	it('renders other token labels', () => {
		const { getByText } = render(ThemeTokens);
		expect(getByText('border')).toBeInTheDocument();
		expect(getByText('depth')).toBeInTheDocument();
		expect(getByText('noise')).toBeInTheDocument();
	});

	it('shows — fallback for tokens not in the mock', () => {
		const { getAllByText } = render(ThemeTokens);
		// All tokens not in the mock map return '' → display '—'
		const dashes = getAllByText('—');
		expect(dashes.length).toBeGreaterThan(0);
	});

	it('does not crash when getComputedStyle returns empty string for all tokens', () => {
		getComputedStyleSpy.mockReturnValue({
			getPropertyValue: () => ''
		} as CSSStyleDeclaration);
		expect(() => render(ThemeTokens)).not.toThrow();
	});
});
```

- [ ] **Step 2: Run tests and confirm they all fail with "Cannot find module"**

```bash
cd /home/dev/@Projects/my-sveltekit-app && npx vitest run src/lib/components/ui/ThemeTokens.test.ts
```

Expected: ERROR — `Cannot find module './ThemeTokens.svelte'`

---

## Task 2: Implement ThemeTokens.svelte

**Files:**
- Create: `src/lib/components/ui/ThemeTokens.svelte`

- [ ] **Step 3: Create the component**

```svelte
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
```

- [ ] **Step 4: Run tests and confirm they all pass**

```bash
cd /home/dev/@Projects/my-sveltekit-app && npx vitest run src/lib/components/ui/ThemeTokens.test.ts
```

Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/ThemeTokens.svelte src/lib/components/ui/ThemeTokens.test.ts
git commit -m "feat: add ThemeTokens component with live CSS variable reading"
```

---

## Task 3: Export, integrate, and verify

**Files:**
- Modify: `src/lib/components/ui/index.ts`
- Modify: `src/routes/playground/+page.svelte`

- [ ] **Step 6: Add export to index.ts**

In `src/lib/components/ui/index.ts`, add after the `ThemeController` export line:

```ts
export { default as ThemeController } from './ThemeController.svelte';
export { default as ThemeTokens } from './ThemeTokens.svelte';
```

- [ ] **Step 7: Add ThemeTokens to playground page**

In `src/routes/playground/+page.svelte`, add `ThemeTokens` to the import:

```ts
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
```

Then insert `<ThemeTokens />` as the first section inside `<main>`, before the Button section:

```svelte
<main class="flex-1 overflow-y-auto overflow-x-hidden">
<div class="container mx-auto p-8 space-y-12 bg-base-200">
    <ThemeTokens />

    <section>
        <h2 class="text-2xl font-bold mb-4">Button</h2>
        ...
```

- [ ] **Step 8: Run the full test suite to verify no regressions**

```bash
cd /home/dev/@Projects/my-sveltekit-app && npx vitest run
```

Expected: All tests PASS

- [ ] **Step 9: Start dev server and verify visually**

```bash
cd /home/dev/@Projects/my-sveltekit-app && npm run dev
```

Navigate to `http://localhost:5173/playground` and verify:
- "Theme Token System" section appears at the top
- Color swatches render with correct brand colors (yellow primary, navy secondary, etc.)
- Radius boxes show different corner shapes
- Other tokens table shows border/depth/noise values
- Toggle dark mode → swatches update immediately to dark theme colors

- [ ] **Step 10: Commit**

```bash
git add src/lib/components/ui/index.ts src/routes/playground/+page.svelte
git commit -m "feat: display ThemeTokens as first section in playground"
```
