# Dark Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `DarkModeToggle` button component to the Navbar that switches the page between `light` and `dark` DaisyUI themes via `data-theme` on `<html>`.

**Architecture:** A new `DarkModeToggle.svelte` component uses Svelte 5 `$state`/`$effect` runes with a DaisyUI `swap swap-rotate` checkbox to toggle `data-theme` between `"light"` and `"dark"`. The component is exported from the UI index and placed in the playground Navbar's `end` snippet.

**Tech Stack:** Svelte 5 (runes), DaisyUI v5, Vitest, @testing-library/svelte

---

## File Map

| File                                           | Action | Responsibility                                                              |
| ---------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `src/lib/components/ui/DarkModeToggle.svelte`  | Create | Toggle button component — `swap swap-rotate`, sets `data-theme` on `<html>` |
| `src/lib/components/ui/DarkModeToggle.test.ts` | Create | Unit tests for toggle behavior                                              |
| `src/lib/components/ui/index.ts`               | Modify | Add `DarkModeToggle` export                                                 |
| `src/routes/playground/+page.svelte`           | Modify | Import and place `DarkModeToggle` in navbar-end                             |

---

### Task 1: Write failing tests for DarkModeToggle

**Files:**

- Create: `src/lib/components/ui/DarkModeToggle.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// src/lib/components/ui/DarkModeToggle.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import DarkModeToggle from './DarkModeToggle.svelte';

describe('DarkModeToggle', () => {
	it('renders a swap element', () => {
		const { container } = render(DarkModeToggle);
		expect(container.querySelector('.swap')).toBeInTheDocument();
	});

	it('renders a hidden checkbox input', () => {
		const { container } = render(DarkModeToggle);
		expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
	});

	it('sets data-theme to light on mount', () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		render(DarkModeToggle);
		expect(spy).toHaveBeenCalledWith('data-theme', 'light');
		spy.mockRestore();
	});

	it('sets data-theme to dark when checkbox is clicked', async () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		const { container } = render(DarkModeToggle);
		const checkbox = container.querySelector('input[type="checkbox"]')!;
		await fireEvent.click(checkbox);
		expect(spy).toHaveBeenCalledWith('data-theme', 'dark');
		spy.mockRestore();
	});

	it('sets data-theme back to light when clicked again', async () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		const { container } = render(DarkModeToggle);
		const checkbox = container.querySelector('input[type="checkbox"]')!;
		await fireEvent.click(checkbox); // → dark
		await fireEvent.click(checkbox); // → light
		expect(spy).toHaveBeenLastCalledWith('data-theme', 'light');
		spy.mockRestore();
	});
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test -- DarkModeToggle
```

Expected output: tests fail with `Cannot find module './DarkModeToggle.svelte'`

---

### Task 2: Implement DarkModeToggle component

**Files:**

- Create: `src/lib/components/ui/DarkModeToggle.svelte`

- [ ] **Step 3: Create the component**

```svelte
<!-- src/lib/components/ui/DarkModeToggle.svelte -->
<script lang="ts">
	let isDark = $state(false);

	$effect(() => {
		document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
	});
</script>

<label class="swap swap-rotate btn btn-ghost btn-circle">
	<input type="checkbox" bind:checked={isDark} />

	<!-- sun icon — shown when isDark = true -->
	<svg class="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<path
			d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,0,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
		/>
	</svg>

	<!-- moon icon — shown when isDark = false -->
	<svg class="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<path
			d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
		/>
	</svg>
</label>
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test -- DarkModeToggle
```

Expected output: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/DarkModeToggle.svelte src/lib/components/ui/DarkModeToggle.test.ts
git commit -m "feat: add DarkModeToggle component"
```

---

### Task 3: Export DarkModeToggle from index

**Files:**

- Modify: `src/lib/components/ui/index.ts`

- [ ] **Step 6: Add export line (alphabetical order, after `Card`)**

Current `index.ts`:

```typescript
export { default as Alert } from './Alert.svelte';
export { default as Avatar } from './Avatar.svelte';
export { default as Badge } from './Badge.svelte';
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Dropdown } from './Dropdown.svelte';
export { default as Input } from './Input.svelte';
export { default as Modal } from './Modal.svelte';
export { default as Navbar } from './Navbar.svelte';
export { default as Select } from './Select.svelte';
export { default as ThemeController } from './ThemeController.svelte';
export { default as Toggle } from './Toggle.svelte';
```

Add `DarkModeToggle` after `Card`:

```typescript
export { default as Alert } from './Alert.svelte';
export { default as Avatar } from './Avatar.svelte';
export { default as Badge } from './Badge.svelte';
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as DarkModeToggle } from './DarkModeToggle.svelte';
export { default as Dropdown } from './Dropdown.svelte';
export { default as Input } from './Input.svelte';
export { default as Modal } from './Modal.svelte';
export { default as Navbar } from './Navbar.svelte';
export { default as Select } from './Select.svelte';
export { default as ThemeController } from './ThemeController.svelte';
export { default as Toggle } from './Toggle.svelte';
```

- [ ] **Step 7: Run full test suite to confirm no regressions**

```bash
npm run test
```

Expected output: all tests pass

- [ ] **Step 8: Commit**

```bash
git add src/lib/components/ui/index.ts
git commit -m "feat: export DarkModeToggle from ui index"
```

---

### Task 4: Add DarkModeToggle to playground Navbar

**Files:**

- Modify: `src/routes/playground/+page.svelte`

- [ ] **Step 9: Add DarkModeToggle to the import list and navbar-end snippet**

Current `+page.svelte` imports (lines 1–15):

```svelte
<script lang="ts">
	import {
		Alert,
		Avatar,
		Badge,
		Button,
		Card,
		Dropdown,
		Input,
		Modal,
		Navbar,
		Select,
		ThemeController,
		Toggle
	} from '$lib/components/ui';
```

Updated imports — add `DarkModeToggle`:

```svelte
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
		Modal,
		Navbar,
		Select,
		ThemeController,
		Toggle
	} from '$lib/components/ui';
```

Current `navbar-end` snippet (lines 25–30):

```svelte
{#snippet end()}
	<div class="flex items-center gap-3">
		<Badge variant="badge-success">DaisyUI v5</Badge>
		<div><ThemeController /></div>
	</div>
{/snippet}
```

Updated — add `<DarkModeToggle />` after ThemeController:

```svelte
{#snippet end()}
	<div class="flex items-center gap-3">
		<Badge variant="badge-success">DaisyUI v5</Badge>
		<div><ThemeController /></div>
		<DarkModeToggle />
	</div>
{/snippet}
```

- [ ] **Step 10: Run full test suite**

```bash
npm run test
```

Expected output: all tests pass

- [ ] **Step 11: Commit**

```bash
git add src/routes/playground/+page.svelte
git commit -m "feat: add DarkModeToggle to playground navbar"
```
