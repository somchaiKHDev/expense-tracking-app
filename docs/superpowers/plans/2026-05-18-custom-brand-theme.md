# Custom Brand Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่ม brand theme registry และ grouped ThemeController dropdown บนระบบ DaisyUI v5 ที่มีอยู่ โดยไม่กระทบ built-in themes เดิม

**Architecture:** TypeScript config file (`brands.config.ts`) เป็น source of truth สำหรับ brand themes, CSS theme definitions อยู่ใน `app.css` ผ่าน `@plugin "daisyui/theme"`, และ `ThemeController.svelte` อ่าน config เพื่อแสดง optgroup แยก Brand / Built-in

**Tech Stack:** SvelteKit 5, Svelte 5 (runes), Tailwind CSS v4, DaisyUI v5, Vitest, @testing-library/svelte

---

## File Map

| Action | Path                                            | Responsibility                                |
| ------ | ----------------------------------------------- | --------------------------------------------- |
| Create | `src/lib/themes/brands.config.ts`               | Brand theme registry — names, labels, default |
| Modify | `src/app.css`                                   | CSS color definitions สำหรับแต่ละ brand theme |
| Modify | `src/lib/components/ui/ThemeController.svelte`  | Grouped dropdown อ่านจาก config               |
| Create | `src/lib/components/ui/ThemeController.test.ts` | Unit tests สำหรับ grouped behavior            |

---

## Task 1: สร้าง Brand Theme Registry

**Files:**

- Create: `src/lib/themes/brands.config.ts`

- [ ] **Step 1: สร้างไฟล์ config**

สร้างไฟล์ `src/lib/themes/brands.config.ts` ด้วย content นี้:

```ts
export type BrandTheme = {
	id: string;
	label: string;
};

export const brandThemes: BrandTheme[] = [
	{ id: 'brand-acme', label: 'Acme Corp' },
	{ id: 'brand-nexus', label: 'Nexus' }
];

export const defaultTheme = 'cupcake';
```

> **Convention:** `id` ต้องขึ้นต้นด้วย `brand-` เสมอ เพื่อให้ ThemeController แยกกลุ่มได้

- [ ] **Step 2: Commit**

```bash
git add src/lib/themes/brands.config.ts
git commit -m "feat: add brand theme registry config"
```

---

## Task 2: เพิ่ม Brand CSS Theme Definitions

**Files:**

- Modify: `src/app.css`

- [ ] **Step 1: เพิ่ม brand theme blocks ใน `src/app.css`**

เพิ่ม content นี้ **ต่อท้าย** `@plugin "daisyui"` block ที่มีอยู่ (ไม่แทนที่ built-in themes):

```css
@plugin "daisyui/theme" {
	name: 'brand-acme';
	color-scheme: light;
	--color-primary: oklch(55% 0.2 240);
	--color-primary-content: oklch(98% 0.01 240);
	--color-secondary: oklch(65% 0.15 200);
	--color-secondary-content: oklch(98% 0.01 200);
	--color-accent: oklch(70% 0.18 160);
	--color-accent-content: oklch(98% 0.01 160);
	--color-neutral: oklch(30% 0.02 240);
	--color-neutral-content: oklch(98% 0.01 0);
	--color-base-100: oklch(98% 0 0);
	--color-base-200: oklch(94% 0 0);
	--color-base-300: oklch(89% 0 0);
	--color-base-content: oklch(20% 0.02 240);
	--color-info: oklch(70% 0.15 220);
	--color-success: oklch(65% 0.18 150);
	--color-warning: oklch(75% 0.18 80);
	--color-error: oklch(60% 0.22 25);
}

@plugin "daisyui/theme" {
	name: 'brand-nexus';
	color-scheme: light;
	--color-primary: oklch(60% 0.22 290);
	--color-primary-content: oklch(98% 0.01 290);
	--color-secondary: oklch(65% 0.18 310);
	--color-secondary-content: oklch(98% 0.01 310);
	--color-accent: oklch(75% 0.2 170);
	--color-accent-content: oklch(20% 0.05 170);
	--color-neutral: oklch(25% 0.03 290);
	--color-neutral-content: oklch(95% 0.01 0);
	--color-base-100: oklch(97% 0.01 290);
	--color-base-200: oklch(93% 0.01 290);
	--color-base-300: oklch(88% 0.01 290);
	--color-base-content: oklch(22% 0.03 290);
	--color-info: oklch(70% 0.15 220);
	--color-success: oklch(65% 0.18 150);
	--color-warning: oklch(75% 0.18 80);
	--color-error: oklch(60% 0.22 25);
}
```

หลังจากแก้แล้ว `src/app.css` ทั้งไฟล์ควรมีหน้าตาแบบนี้:

```css
@import 'tailwindcss';
@plugin "daisyui" {
	themes:
		cupcake --default,
		light,
		dark,
		synthwave,
		corporate,
		retro,
		cyberpunk,
		valentine,
		halloween,
		garden,
		forest,
		aqua,
		lofi,
		pastel,
		fantasy,
		wireframe,
		black,
		luxury,
		dracula,
		cmyk,
		autumn,
		business,
		acid,
		lemonade,
		night,
		coffee,
		winter,
		dim,
		nord,
		sunset;
}

@plugin "daisyui/theme" {
	name: 'brand-acme';
	color-scheme: light;
	--color-primary: oklch(55% 0.2 240);
	--color-primary-content: oklch(98% 0.01 240);
	--color-secondary: oklch(65% 0.15 200);
	--color-secondary-content: oklch(98% 0.01 200);
	--color-accent: oklch(70% 0.18 160);
	--color-accent-content: oklch(98% 0.01 160);
	--color-neutral: oklch(30% 0.02 240);
	--color-neutral-content: oklch(98% 0.01 0);
	--color-base-100: oklch(98% 0 0);
	--color-base-200: oklch(94% 0 0);
	--color-base-300: oklch(89% 0 0);
	--color-base-content: oklch(20% 0.02 240);
	--color-info: oklch(70% 0.15 220);
	--color-success: oklch(65% 0.18 150);
	--color-warning: oklch(75% 0.18 80);
	--color-error: oklch(60% 0.22 25);
}

@plugin "daisyui/theme" {
	name: 'brand-nexus';
	color-scheme: light;
	--color-primary: oklch(60% 0.22 290);
	--color-primary-content: oklch(98% 0.01 290);
	--color-secondary: oklch(65% 0.18 310);
	--color-secondary-content: oklch(98% 0.01 310);
	--color-accent: oklch(75% 0.2 170);
	--color-accent-content: oklch(20% 0.05 170);
	--color-neutral: oklch(25% 0.03 290);
	--color-neutral-content: oklch(95% 0.01 0);
	--color-base-100: oklch(97% 0.01 290);
	--color-base-200: oklch(93% 0.01 290);
	--color-base-300: oklch(88% 0.01 290);
	--color-base-content: oklch(22% 0.03 290);
	--color-info: oklch(70% 0.15 220);
	--color-success: oklch(65% 0.18 150);
	--color-warning: oklch(75% 0.18 80);
	--color-error: oklch(60% 0.22 25);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app.css
git commit -m "feat: add brand-acme and brand-nexus CSS theme definitions"
```

---

## Task 3: Update ThemeController ด้วย TDD

**Files:**

- Create: `src/lib/components/ui/ThemeController.test.ts`
- Modify: `src/lib/components/ui/ThemeController.svelte`

### Step 3.1 — เขียน failing tests ก่อน

- [ ] **Step 1: สร้าง `src/lib/components/ui/ThemeController.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ThemeController from './ThemeController.svelte';

describe('ThemeController', () => {
	it('renders a select element', () => {
		const { container } = render(ThemeController);
		expect(container.querySelector('select')).toBeInTheDocument();
	});

	it('renders Brand optgroup', () => {
		const { container } = render(ThemeController);
		expect(container.querySelector('optgroup[label="Brand"]')).toBeInTheDocument();
	});

	it('renders Built-in optgroup', () => {
		const { container } = render(ThemeController);
		expect(container.querySelector('optgroup[label="Built-in"]')).toBeInTheDocument();
	});

	it('shows brand themes in Brand optgroup', () => {
		const { container } = render(ThemeController);
		const brandGroup = container.querySelector('optgroup[label="Brand"]')!;
		const options = brandGroup.querySelectorAll('option');
		expect(options.length).toBeGreaterThan(0);
		expect(options[0]).toHaveValue('brand-acme');
		expect(options[0]).toHaveTextContent('Acme Corp');
	});

	it('shows built-in themes in Built-in optgroup', () => {
		const { container } = render(ThemeController);
		const builtinGroup = container.querySelector('optgroup[label="Built-in"]')!;
		const options = builtinGroup.querySelectorAll('option');
		expect(options.length).toBeGreaterThan(0);
		expect(options[0]).toHaveValue('cupcake');
	});

	it('selects defaultTheme (cupcake) on mount', () => {
		const { container } = render(ThemeController);
		expect(container.querySelector('select')).toHaveValue('cupcake');
	});

	it('sets data-theme attribute when a brand theme is selected', async () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		const { container } = render(ThemeController);
		const select = container.querySelector('select')!;
		await fireEvent.change(select, { target: { value: 'brand-acme' } });
		expect(spy).toHaveBeenCalledWith('data-theme', 'brand-acme');
		spy.mockRestore();
	});

	it('sets data-theme attribute when a built-in theme is selected', async () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		const { container } = render(ThemeController);
		const select = container.querySelector('select')!;
		await fireEvent.change(select, { target: { value: 'dark' } });
		expect(spy).toHaveBeenCalledWith('data-theme', 'dark');
		spy.mockRestore();
	});
});
```

- [ ] **Step 2: รัน test เพื่อยืนยันว่า fail**

```bash
npx vitest run src/lib/components/ui/ThemeController.test.ts
```

Expected output: หลาย tests fail เพราะยังไม่มี optgroup (component ยังไม่ถูก update)

### Step 3.2 — Implement ThemeController

- [ ] **Step 3: แทนที่ content ทั้งหมดของ `src/lib/components/ui/ThemeController.svelte`**

```svelte
<script lang="ts">
	import { brandThemes, defaultTheme } from '$lib/themes/brands.config';

	const builtinThemes = [
		'cupcake',
		'light',
		'dark',
		'synthwave',
		'corporate',
		'retro',
		'cyberpunk',
		'valentine',
		'halloween',
		'garden',
		'forest',
		'aqua',
		'lofi',
		'pastel',
		'fantasy',
		'wireframe',
		'black',
		'luxury',
		'dracula',
		'cmyk',
		'autumn',
		'business',
		'acid',
		'lemonade',
		'night',
		'coffee',
		'winter',
		'dim',
		'nord',
		'sunset'
	];

	let current = $state(defaultTheme);

	function onChange(e: Event) {
		current = (e.target as HTMLSelectElement).value;
		document.documentElement.setAttribute('data-theme', current);
	}
</script>

<select class="select select-bordered select-sm" value={current} onchange={onChange}>
	<optgroup label="Brand">
		{#each brandThemes as theme}
			<option value={theme.id}>{theme.label}</option>
		{/each}
	</optgroup>
	<optgroup label="Built-in">
		{#each builtinThemes as theme}
			<option value={theme}>{theme}</option>
		{/each}
	</optgroup>
</select>
```

- [ ] **Step 4: รัน tests เพื่อยืนยันว่า pass ทั้งหมด**

```bash
npx vitest run src/lib/components/ui/ThemeController.test.ts
```

Expected output:

```
✓ ThemeController > renders a select element
✓ ThemeController > renders Brand optgroup
✓ ThemeController > renders Built-in optgroup
✓ ThemeController > shows brand themes in Brand optgroup
✓ ThemeController > shows built-in themes in Built-in optgroup
✓ ThemeController > selects defaultTheme (cupcake) on mount
✓ ThemeController > sets data-theme attribute when a brand theme is selected
✓ ThemeController > sets data-theme attribute when a built-in theme is selected

Test Files  1 passed (1)
Tests  8 passed (8)
```

- [ ] **Step 5: รัน full test suite เพื่อตรวจ regression**

```bash
npm run test
```

Expected: all tests pass (ไม่มี test เดิมที่ break)

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/ui/ThemeController.svelte src/lib/components/ui/ThemeController.test.ts
git commit -m "feat: update ThemeController with grouped brand/built-in dropdown"
```

---

## การเพิ่ม Brand ใหม่ในอนาคต

ทำ 2 ขั้นตอนเสมอ:

1. เพิ่ม entry ใน `src/lib/themes/brands.config.ts`:

   ```ts
   { id: 'brand-omega', label: 'Omega' }
   ```

2. เพิ่ม `@plugin "daisyui/theme"` block ใน `src/app.css`:
   ```css
   @plugin "daisyui/theme" {
   	name: 'brand-omega';
   	/* color variables */
   }
   ```

ไม่ต้องแก้ไฟล์อื่นใด ThemeController รับ brand ใหม่โดยอัตโนมัติ
