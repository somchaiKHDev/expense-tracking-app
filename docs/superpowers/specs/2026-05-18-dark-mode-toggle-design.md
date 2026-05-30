# Dark Mode Toggle — Design Spec

**Date:** 2026-05-18
**Status:** Approved

## Overview

Add a light/dark mode toggle button to the Navbar in the playground page. The button uses a sun/moon icon with swap-rotate animation (DaisyUI `swap`) and switches the page theme by setting `data-theme` on `<html>`.

## Component

**File:** `src/lib/components/ui/DarkModeToggle.svelte`

- Uses DaisyUI `swap swap-rotate` with SVG sun and moon icons
- Toggles `document.documentElement.setAttribute('data-theme', ...)` between `light` and `dark`
- Default state: `light`
- No localStorage persistence — resets to `light` on page refresh
- Independent of `ThemeController` — both can coexist on the same page without shared state
- Exported from `src/lib/components/ui/index.ts`

## Placement

In `src/routes/playground/+page.svelte`, the `DarkModeToggle` is placed inside `navbar-end` immediately after the existing `ThemeController`:

```svelte
{#snippet end()}
	<div class="flex items-center gap-3">
		<Badge variant="badge-success">DaisyUI v5</Badge>
		<div><ThemeController /></div>
		<DarkModeToggle />
	</div>
{/snippet}
```

## Behavior

| State           | Icon shown | Click action              |
| --------------- | ---------- | ------------------------- |
| Light (default) | 🌙 moon    | Sets `data-theme="dark"`  |
| Dark            | ☀️ sun     | Sets `data-theme="light"` |

## Files Changed

| File                                          | Change                                           |
| --------------------------------------------- | ------------------------------------------------ |
| `src/lib/components/ui/DarkModeToggle.svelte` | New component                                    |
| `src/lib/components/ui/index.ts`              | Export `DarkModeToggle`                          |
| `src/routes/playground/+page.svelte`          | Import and render `DarkModeToggle` in navbar-end |

## Out of Scope

- localStorage persistence
- Respecting OS `prefers-color-scheme`
- Interaction/sync with ThemeController dropdown
